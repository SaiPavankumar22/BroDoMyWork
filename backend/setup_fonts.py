#!/usr/bin/env python3
"""
Download handwriting fonts into backend/assets/fonts.
"""

from pathlib import Path
import requests


FONT_SOURCES = {
    "Caveat-Regular.ttf": "https://raw.githubusercontent.com/google/fonts/main/ofl/caveat/Caveat%5Bwght%5D.ttf",
    "DancingScript-Regular.ttf": "https://raw.githubusercontent.com/google/fonts/main/ofl/dancingscript/DancingScript%5Bwght%5D.ttf",
    "PatrickHand-Regular.ttf": "https://raw.githubusercontent.com/google/fonts/main/ofl/patrickhand/PatrickHand-Regular.ttf",
    "IndieFlower-Regular.ttf": "https://raw.githubusercontent.com/google/fonts/main/ofl/indieflower/IndieFlower-Regular.ttf",
    "Kalam-Regular.ttf": "https://raw.githubusercontent.com/google/fonts/main/ofl/kalam/Kalam-Regular.ttf",
    "ShadowsIntoLight-Regular.ttf": "https://raw.githubusercontent.com/google/fonts/main/ofl/shadowsintolighttwo/ShadowsIntoLightTwo-Regular.ttf",
}


def download_font(filename: str, url: str, target_dir: Path) -> None:
    target_dir.mkdir(parents=True, exist_ok=True)
    destination = target_dir / filename

    print(f"Downloading {filename}...")
    response = requests.get(url, timeout=30)
    response.raise_for_status()
    destination.write_bytes(response.content)
    print(f"Saved to {destination}")


def main() -> None:
    fonts_dir = Path(__file__).resolve().parent / "assets" / "fonts"
    print(f"Installing fonts into {fonts_dir}")

    failures: list[str] = []

    for filename, url in FONT_SOURCES.items():
        try:
            download_font(filename, url, fonts_dir)
        except Exception as exc:
            failures.append(f"{filename}: {exc}")
            print(f"Failed to download {filename}: {exc}")

    print("\nInstalled fonts:")
    for font_file in sorted(fonts_dir.glob("*.ttf")):
        print(f"  - {font_file.name}")

    if failures:
        print("\nSome fonts could not be downloaded:")
        for failure in failures:
            print(f"  - {failure}")


if __name__ == "__main__":
    main()
