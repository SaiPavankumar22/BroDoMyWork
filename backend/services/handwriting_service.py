from __future__ import annotations

from pathlib import Path
from typing import Callable, Dict, List, Optional, Tuple
import logging
import random

from PIL import Image, ImageDraw, ImageFont

from models.schemas import FontStyle, QuestionAnswer, TemplateType

logger = logging.getLogger(__name__)


class HandwritingService:
    def __init__(self):
        self.base_dir = Path(__file__).resolve().parent.parent
        self.fonts_dir = self.base_dir / "assets" / "fonts"
        self.output_dir = self.base_dir / "output"

        self.fonts_dir.mkdir(parents=True, exist_ok=True)
        self.output_dir.mkdir(parents=True, exist_ok=True)

        self.page_width = 2480
        self.page_height = 3508
        self.margin_top = 280
        self.margin_bottom = 230
        self.default_left_margin = 210
        self.default_right_margin = 190

        self.font_configs: Dict[FontStyle, Dict[str, object]] = {
            FontStyle.CAVEAT: {
                "candidates": ["Caveat-Regular.ttf", "comic.ttf", "comicbd.ttf"],
                "display_name": "Caveat",
                "size": 82,
                "line_height": 112,
                "answer_indent": 92,
            },
            FontStyle.DANCING: {
                "candidates": ["DancingScript-Regular.ttf", "comic.ttf", "comicbd.ttf"],
                "display_name": "Dancing Script",
                "size": 86,
                "line_height": 116,
                "answer_indent": 96,
            },
            FontStyle.PATRICK: {
                "candidates": ["PatrickHand-Regular.ttf", "comic.ttf", "comicbd.ttf"],
                "display_name": "Patrick Hand",
                "size": 76,
                "line_height": 106,
                "answer_indent": 86,
            },
            FontStyle.INDIE: {
                "candidates": ["IndieFlower-Regular.ttf", "comic.ttf", "comici.ttf"],
                "display_name": "Indie Flower",
                "size": 74,
                "line_height": 104,
                "answer_indent": 82,
            },
            FontStyle.KALAM: {
                "candidates": ["Kalam-Regular.ttf", "comic.ttf", "comicbd.ttf"],
                "display_name": "Kalam",
                "size": 76,
                "line_height": 106,
                "answer_indent": 88,
            },
            FontStyle.SHADOWS: {
                "candidates": ["ShadowsIntoLight-Regular.ttf", "comic.ttf", "comicbd.ttf"],
                "display_name": "Shadows Into Light",
                "size": 80,
                "line_height": 110,
                "answer_indent": 88,
            },
        }

        self.last_font_used = "default"
        self.last_warnings: List[str] = []

    async def render_assignment(
        self,
        questions_and_answers: List[QuestionAnswer],
        template: TemplateType,
        font_style: FontStyle,
        name: str,
        roll_number: str,
        session_id: str,
        status_callback: Optional[Callable] = None,
    ) -> List[str]:
        try:
            if not questions_and_answers:
                raise ValueError("No questions and answers were provided for rendering.")

            rng = random.Random(f"{session_id}:{template}:{font_style}:{name}:{roll_number}")
            font_bundle = self._load_font_bundle(font_style)
            metrics = self._get_template_metrics(template)

            pages: List[str] = []
            page_number = 1
            page_image = self._create_page_template(template, metrics)
            draw = ImageDraw.Draw(page_image)
            current_y = self._add_header_info(
                draw=draw,
                name=name,
                roll_number=roll_number,
                font=font_bundle["header_font"],
                metrics=metrics,
                rng=rng,
            )

            total_items = len(questions_and_answers)

            for index, question_answer in enumerate(questions_and_answers, start=1):
                if status_callback:
                    progress = int(((index - 1) / total_items) * 100)
                    status_callback(progress, f"Rendering answer {index}/{total_items}")

                block_height = self._estimate_question_block_height(
                    draw=draw,
                    question_answer=question_answer,
                    body_font=font_bundle["body_font"],
                    metrics=metrics,
                    answer_indent=font_bundle["answer_indent"],
                )

                if current_y + block_height > self.page_height - self.margin_bottom:
                    page_path = self.output_dir / f"{session_id}_page_{page_number}.png"
                    page_image.save(page_path, "PNG", optimize=True)
                    pages.append(str(page_path))

                    page_number += 1
                    page_image = self._create_page_template(template, metrics)
                    draw = ImageDraw.Draw(page_image)
                    current_y = self._snap_to_baseline(self.margin_top, metrics)

                current_y = self._render_question_answer(
                    draw=draw,
                    question_answer=question_answer,
                    question_number=index,
                    body_font=font_bundle["body_font"],
                    metrics=metrics,
                    current_y=current_y,
                    answer_indent=font_bundle["answer_indent"],
                    rng=rng,
                )

            page_path = self.output_dir / f"{session_id}_page_{page_number}.png"
            page_image.save(page_path, "PNG", optimize=True)
            pages.append(str(page_path))

            if status_callback:
                status_callback(100, f"Rendered {len(pages)} page(s)")

            return pages

        except Exception as exc:
            logger.error("Handwriting rendering failed: %s", exc)
            raise Exception(f"Rendering failed: {exc}") from exc

    def _load_font_bundle(self, font_style: FontStyle) -> Dict[str, object]:
        config = self.font_configs[font_style]
        candidates = config["candidates"]
        font_path = self._resolve_font_path(candidates)
        self.last_warnings = []

        if font_path is None:
            self.last_font_used = "Pillow default font"
            self.last_warnings.append(
                "No configured handwriting font was found. Rendering fell back to the default Pillow bitmap font."
            )
            logger.warning("No handwriting font found for %s", font_style.value)
            return {
                "body_font": ImageFont.load_default(),
                "header_font": ImageFont.load_default(),
                "answer_indent": int(config["answer_indent"]),
            }

        self.last_font_used = font_path.name
        if font_path.parent.name.lower() == "fonts":
            logger.info("Using handwriting font asset: %s", font_path)
        else:
            self.last_warnings.append(
                f"Using system fallback font '{font_path.name}' because the project handwriting assets are missing."
            )
            logger.info("Using system fallback font: %s", font_path)

        body_font = ImageFont.truetype(str(font_path), int(config["size"]))
        header_font = ImageFont.truetype(str(font_path), max(52, int(int(config["size"]) * 0.72)))
        return {
            "body_font": body_font,
            "header_font": header_font,
            "answer_indent": int(config["answer_indent"]),
        }

    def _resolve_font_path(self, candidates: object) -> Optional[Path]:
        font_candidates = [self.fonts_dir / str(candidate) for candidate in candidates]
        system_roots = [
            Path("C:/Windows/Fonts"),
            Path("/usr/share/fonts"),
            Path("/usr/local/share/fonts"),
        ]

        for candidate in font_candidates:
            if candidate.exists():
                return candidate

        for root in system_roots:
            for candidate in candidates:
                system_candidate = root / str(candidate)
                if system_candidate.exists():
                    return system_candidate

        return None

    def _get_template_metrics(self, template: TemplateType) -> Dict[str, int]:
        base = {
            "left_margin": self.default_left_margin,
            "right_margin": self.default_right_margin,
            "line_spacing": 112,
            "margin_line_x": self.default_left_margin - 44,
            "baseline_offset": 86,
        }

        if template == TemplateType.RULED:
            return base
        if template == TemplateType.DOUBLE_RULED:
            return {**base, "margin_line_x": self.default_left_margin - 54}
        if template == TemplateType.NOTEBOOK:
            return {
                **base,
                "left_margin": self.default_left_margin + 44,
                "margin_line_x": self.default_left_margin - 14,
                "line_spacing": 106,
                "baseline_offset": 80,
            }
        if template == TemplateType.GRAPH:
            return {**base, "line_spacing": 96, "baseline_offset": 72}
        if template == TemplateType.DOTTED:
            return {**base, "line_spacing": 100, "baseline_offset": 76}
        if template == TemplateType.BLANK:
            return {**base, "line_spacing": 110, "baseline_offset": 78}
        return base

    def _create_page_template(self, template: TemplateType, metrics: Dict[str, int]) -> Image.Image:
        page = Image.new("RGB", (self.page_width, self.page_height), "#fffdf8")
        draw = ImageDraw.Draw(page)

        left_margin = metrics["left_margin"]
        right_edge = self.page_width - self.default_right_margin
        top = self.margin_top
        bottom = self.page_height - self.margin_bottom

        if template in {TemplateType.RULED, TemplateType.DOUBLE_RULED, TemplateType.NOTEBOOK}:
            line_color = "#d7def0" if template != TemplateType.NOTEBOOK else "#b5d0f5"
            x_start = left_margin if template == TemplateType.RULED else metrics["margin_line_x"] + 24
            for y in range(top, bottom, metrics["line_spacing"]):
                draw.line([(x_start, y), (right_edge, y)], fill=line_color, width=2)

        if template in {TemplateType.DOUBLE_RULED, TemplateType.NOTEBOOK}:
            draw.line(
                [(metrics["margin_line_x"], top - 40), (metrics["margin_line_x"], bottom)],
                fill="#f08f8f",
                width=3,
            )

        if template == TemplateType.NOTEBOOK:
            for y in range(250, self.page_height - 260, 260):
                draw.ellipse([(58, y), (88, y + 30)], fill="#fffaf4", outline="#d5d1c8", width=2)

        if template == TemplateType.GRAPH:
            spacing = 72
            for x in range(left_margin, right_edge, spacing):
                draw.line([(x, top), (x, bottom)], fill="#e3e1db", width=1)
            for y in range(top, bottom, spacing):
                draw.line([(left_margin, y), (right_edge, y)], fill="#e3e1db", width=1)

        if template == TemplateType.DOTTED:
            spacing = 70
            for x in range(left_margin, right_edge, spacing):
                for y in range(top, bottom, spacing):
                    draw.ellipse([(x - 2, y - 2), (x + 2, y + 2)], fill="#d7d2cb")

        return page

    def _add_header_info(
        self,
        draw: ImageDraw.Draw,
        name: str,
        roll_number: str,
        font: ImageFont.ImageFont,
        metrics: Dict[str, int],
        rng: random.Random,
    ) -> int:
        text_color = self._ink_color(rng)
        header_right = self.page_width - self.default_right_margin - 20
        header_top = 120

        name_label = f"Name: {name}".strip()
        roll_label = f"Roll No: {roll_number}".strip()

        name_width = draw.textlength(name_label, font=font)
        roll_width = draw.textlength(roll_label, font=font)

        draw.text((header_right - name_width + rng.randint(-6, 4), header_top + rng.randint(-2, 2)), name_label, font=font, fill=text_color)
        draw.text(
            (header_right - roll_width + rng.randint(-6, 4), header_top + 66 + rng.randint(-2, 2)),
            roll_label,
            font=font,
            fill=text_color,
        )

        separator_y = header_top + 150
        draw.line(
            [(metrics["left_margin"], separator_y), (self.page_width - self.default_right_margin, separator_y)],
            fill="#ece5db",
            width=2,
        )
        return self._snap_to_baseline(separator_y + metrics["line_spacing"], metrics)

    def _render_question_answer(
        self,
        draw: ImageDraw.Draw,
        question_answer: QuestionAnswer,
        question_number: int,
        body_font: ImageFont.ImageFont,
        metrics: Dict[str, int],
        current_y: int,
        answer_indent: int,
        rng: random.Random,
    ) -> int:
        question_lines = self._wrap_text(
            draw=draw,
            text=f"Q{question_number}. {question_answer.question.strip()}",
            font=body_font,
            max_width=self._max_width(metrics, 0),
        )
        answer_lines = self._wrap_text(
            draw=draw,
            text=f"Ans. {question_answer.answer.strip()}",
            font=body_font,
            max_width=self._max_width(metrics, answer_indent),
        )

        current_y = self._draw_text_lines(
            draw=draw,
            lines=question_lines,
            font=body_font,
            start_x=metrics["left_margin"],
            start_y=current_y,
            metrics=metrics,
            rng=rng,
        )
        current_y += max(28, metrics["line_spacing"] // 4)
        current_y = self._draw_text_lines(
            draw=draw,
            lines=answer_lines,
            font=body_font,
            start_x=metrics["left_margin"] + answer_indent,
            start_y=current_y,
            metrics=metrics,
            rng=rng,
        )
        return current_y + max(54, metrics["line_spacing"] // 2)

    def _estimate_question_block_height(
        self,
        draw: ImageDraw.Draw,
        question_answer: QuestionAnswer,
        body_font: ImageFont.ImageFont,
        metrics: Dict[str, int],
        answer_indent: int,
    ) -> int:
        question_lines = self._wrap_text(
            draw=draw,
            text=f"Q. {question_answer.question.strip()}",
            font=body_font,
            max_width=self._max_width(metrics, 0),
        )
        answer_lines = self._wrap_text(
            draw=draw,
            text=f"Ans. {question_answer.answer.strip()}",
            font=body_font,
            max_width=self._max_width(metrics, answer_indent),
        )
        return (len(question_lines) + len(answer_lines)) * metrics["line_spacing"] + 120

    def _wrap_text(
        self,
        draw: ImageDraw.Draw,
        text: str,
        font: ImageFont.ImageFont,
        max_width: int,
    ) -> List[str]:
        words = text.split()
        if not words:
            return [""]

        lines: List[str] = []
        current_line = words[0]

        for word in words[1:]:
            proposed = f"{current_line} {word}"
            if draw.textlength(proposed, font=font) <= max_width:
                current_line = proposed
            else:
                lines.append(current_line)
                current_line = word

        lines.append(current_line)
        return lines

    def _draw_text_lines(
        self,
        draw: ImageDraw.Draw,
        lines: List[str],
        font: ImageFont.ImageFont,
        start_x: int,
        start_y: int,
        metrics: Dict[str, int],
        rng: random.Random,
    ) -> int:
        current_y = self._snap_to_baseline(start_y, metrics)

        for line in lines:
            word_x = start_x
            for word in line.split():
                token = f"{word} "
                x_offset = rng.randint(-4, 4)
                y_offset = rng.randint(-4, 3)
                fill = self._ink_color(rng)
                draw.text(
                    (word_x + x_offset, current_y - metrics["baseline_offset"] + y_offset),
                    token,
                    font=font,
                    fill=fill,
                )

                if rng.random() < 0.09:
                    draw.text(
                        (
                            word_x + x_offset + rng.randint(-1, 1),
                            current_y - metrics["baseline_offset"] + y_offset + rng.randint(-1, 1),
                        ),
                        token,
                        font=font,
                        fill=fill,
                    )

                word_x += int(draw.textlength(token, font=font)) + rng.randint(2, 10)

            current_y += metrics["line_spacing"]

        return current_y

    def _snap_to_baseline(self, y_value: int, metrics: Dict[str, int]) -> int:
        relative = max(y_value - self.margin_top, 0)
        line_index = round(relative / metrics["line_spacing"])
        return self.margin_top + line_index * metrics["line_spacing"]

    def _max_width(self, metrics: Dict[str, int], indent: int) -> int:
        return self.page_width - metrics["left_margin"] - self.default_right_margin - indent - 40

    def _ink_color(self, rng: random.Random) -> Tuple[int, int, int]:
        shade = rng.randint(28, 62)
        return (shade, shade - rng.randint(0, 6), shade + rng.randint(0, 8))
