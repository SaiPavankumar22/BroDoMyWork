from PIL import Image
import img2pdf
import os
from pathlib import Path
from typing import List
import logging

logger = logging.getLogger(__name__)

class PDFService:
    def __init__(self):
        self.output_dir = Path(__file__).resolve().parent.parent / "output"
        os.makedirs(self.output_dir, exist_ok=True)
    
    async def create_pdf(
        self,
        page_images: List[str],
        session_id: str,
        filename: str = "assignment.pdf"
    ) -> str:
        """Convert page images to PDF"""
        
        try:
            # Ensure filename is safe
            safe_filename = "".join(c for c in filename if c.isalnum() or c in "._- ").strip()
            if not safe_filename.endswith('.pdf'):
                safe_filename += '.pdf'
            
            pdf_path = str(self.output_dir / f"{session_id}_{safe_filename}")
            
            # Convert images to PDF
            with open(pdf_path, "wb") as pdf_file:
                # Convert all page images to PDF
                pdf_bytes = img2pdf.convert(page_images)
                pdf_file.write(pdf_bytes)
            
            logger.info(f"PDF created successfully: {pdf_path}")
            return pdf_path
            
        except Exception as e:
            logger.error(f"PDF creation failed: {str(e)}")
            raise Exception(f"PDF generation failed: {str(e)}")
    
    def cleanup_images(self, image_paths: List[str]):
        """Clean up temporary image files"""
        for image_path in image_paths:
            try:
                if os.path.exists(image_path):
                    os.remove(image_path)
            except Exception as e:
                logger.warning(f"Failed to cleanup image {image_path}: {str(e)}")
