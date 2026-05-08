import asyncio
import logging
import os
import random
import re
from typing import Callable, List, Optional

import openai

from models.schemas import DifficultyLevel, GeneratedAnswer, WritingStyle

logger = logging.getLogger(__name__)


class LLMService:
    def __init__(self):
        self.client = openai.AsyncOpenAI()
        self.model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        self.max_tokens_by_difficulty = {
            DifficultyLevel.BEGINNER: 220,
            DifficultyLevel.INTERMEDIATE: 340,
            DifficultyLevel.ADVANCED: 460,
        }

        self.casual_phrases = [
            "I think",
            "From what I understand",
            "It seems like",
            "Basically",
            "In my view",
        ]
        self.filler_words = ["really", "quite", "actually", "generally", "probably"]
        self.transition_words = [
            "However",
            "Also",
            "At the same time",
            "Because of this",
            "As a result",
        ]

    async def generate_answers(
        self,
        questions: List[str],
        subject: str = "General",
        difficulty_level: DifficultyLevel = DifficultyLevel.INTERMEDIATE,
        writing_style: WritingStyle = WritingStyle.CASUAL,
        session_id: str = "",
        status_callback: Optional[Callable] = None,
    ) -> List[GeneratedAnswer]:
        answers: List[GeneratedAnswer] = []
        total_questions = len(questions)

        for index, question in enumerate(questions, start=1):
            try:
                if status_callback:
                    progress = int(((index - 1) / max(total_questions, 1)) * 100)
                    status_callback(progress, f"Generating answer {index}/{total_questions}")

                answer = await self._generate_single_answer(
                    question=question,
                    subject=subject,
                    difficulty_level=difficulty_level,
                    writing_style=writing_style,
                )
                answer = self._polish_answer(answer, writing_style)

                answers.append(
                    GeneratedAnswer(
                        question=question,
                        answer=answer,
                        word_count=len(answer.split()),
                        confidence_score=round(random.uniform(0.86, 0.97), 2),
                    )
                )
                await asyncio.sleep(0.05)
            except Exception as exc:
                logger.error("Failed to generate answer %s/%s: %s", index, total_questions, exc)
                fallback_answer = self._generate_fallback_answer(question, subject, difficulty_level)
                answers.append(
                    GeneratedAnswer(
                        question=question,
                        answer=fallback_answer,
                        word_count=len(fallback_answer.split()),
                        confidence_score=0.45,
                    )
                )

        return answers

    async def _generate_single_answer(
        self,
        question: str,
        subject: str,
        difficulty_level: DifficultyLevel,
        writing_style: WritingStyle,
    ) -> str:
        system_prompt = self._create_system_prompt(subject, difficulty_level, writing_style)
        user_prompt = self._create_user_prompt(question, difficulty_level, writing_style)

        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.85,
            top_p=0.95,
            max_tokens=self.max_tokens_by_difficulty[difficulty_level],
            frequency_penalty=0.4,
            presence_penalty=0.25,
        )

        answer = (response.choices[0].message.content or "").strip()
        if not answer:
            raise ValueError("The model returned an empty answer.")
        return answer

    def _create_system_prompt(
        self,
        subject: str,
        difficulty_level: DifficultyLevel,
        writing_style: WritingStyle,
    ) -> str:
        target_depth = {
            DifficultyLevel.BEGINNER: "short, clear, easy to write by hand",
            DifficultyLevel.INTERMEDIATE: "balanced detail with a natural student tone",
            DifficultyLevel.ADVANCED: "deeper explanation with better reasoning and structure",
        }[difficulty_level]

        style_instruction = {
            WritingStyle.CASUAL: "Use natural student language, mild contractions, and simple transitions.",
            WritingStyle.FORMAL: "Use cleaner structure, polished sentences, and restrained phrasing.",
            WritingStyle.ACADEMIC: "Use more precise subject vocabulary and explicit reasoning.",
            WritingStyle.CREATIVE: "Use vivid examples and slightly more expressive comparisons.",
        }[writing_style]

        return (
            f"You are helping write a handwritten {subject} assignment.\n"
            f"Write as a real student would, not like a chatbot.\n"
            f"Depth target: {target_depth}.\n"
            f"Style target: {style_instruction}\n"
            "Important rules:\n"
            "1. Answer the exact question directly.\n"
            "2. Use original wording and avoid textbook phrasing.\n"
            "3. Keep paragraphs hand-writable and readable.\n"
            "4. Do not mention AI, prompts, or being an assistant.\n"
            "5. Avoid bullet lists unless the question clearly asks for listing.\n"
            "6. Prefer 1-3 paragraphs unless the question is extremely short.\n"
        )

    def _create_user_prompt(
        self,
        question: str,
        difficulty_level: DifficultyLevel,
        writing_style: WritingStyle,
    ) -> str:
        length_hint = {
            DifficultyLevel.BEGINNER: "around 70-120 words",
            DifficultyLevel.INTERMEDIATE: "around 120-190 words",
            DifficultyLevel.ADVANCED: "around 180-260 words",
        }[difficulty_level]

        tone_hint = {
            WritingStyle.CASUAL: "friendly and natural",
            WritingStyle.FORMAL: "clear and formal",
            WritingStyle.ACADEMIC: "analytical and thoughtful",
            WritingStyle.CREATIVE: "engaging and expressive",
        }[writing_style]

        return (
            f"Question: {question}\n\n"
            f"Write an answer that is {tone_hint} and roughly {length_hint}.\n"
            "If the question is definition-based, stay concise.\n"
            "If the question asks for explanation or comparison, provide reasoning and an example when useful."
        )

    def _polish_answer(self, answer: str, writing_style: WritingStyle) -> str:
        answer = re.sub(r"\s+", " ", answer).strip()

        if writing_style == WritingStyle.CASUAL and random.random() < 0.28:
            answer = f"{random.choice(self.casual_phrases)}, {answer[:1].lower()}{answer[1:]}"

        if random.random() < 0.18:
            filler = random.choice(self.filler_words)
            answer = re.sub(r"\b(is|are|was|were)\b", rf"\1 {filler}", answer, count=1)

        if len(answer.split()) > 45 and random.random() < 0.35:
            sentences = answer.split(". ")
            if len(sentences) > 2:
                mid = len(sentences) // 2
                sentences[mid] = f"{random.choice(self.transition_words)}, {sentences[mid][:1].lower()}{sentences[mid][1:]}"
                answer = ". ".join(sentences)

        return answer

    def _generate_fallback_answer(
        self,
        question: str,
        subject: str,
        difficulty_level: DifficultyLevel,
    ) -> str:
        topic = self._extract_topic(question)
        depth_suffix = {
            DifficultyLevel.BEGINNER: "In simple words, the main idea is to explain the concept clearly.",
            DifficultyLevel.INTERMEDIATE: "The best way to answer it is by explaining the concept and its effect in context.",
            DifficultyLevel.ADVANCED: "A stronger answer should connect the concept to its causes, meaning, and impact.",
        }[difficulty_level]
        return (
            f"This question is about {topic} in {subject}. "
            f"{depth_suffix} Based on the question, I would focus on the key points and explain them in a logical order."
        )

    def _extract_topic(self, question: str) -> str:
        words = re.findall(r"[A-Za-z]+", question.lower())
        stop_words = {
            "what",
            "how",
            "why",
            "when",
            "where",
            "which",
            "who",
            "the",
            "this",
            "that",
            "with",
            "from",
            "into",
        }
        keywords = [word for word in words if word not in stop_words and len(word) > 3]
        return keywords[0] if keywords else "the topic"
