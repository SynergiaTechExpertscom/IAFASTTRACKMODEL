# encoding: iso-8859-1
import io

from django.test import TestCase
from django.urls import reverse

from pypdf import PdfReader

from .models import Cliente


class PdfGenerationTests(TestCase):
    def setUp(self):
        self.cliente = Cliente.objects.create(
            nombre_cliente="ACME",
            resumen_json={
                "nombre_piloto": "Piloto IA",
                "categoria_piloto": "Categoría",
                "subcategoria_piloto": "Sub",
                "problema_actual_descripcion": "Problema de prueba",
                "solucion_descripcion": "Solución de prueba",
                "solucion_tecnologias": "IA, ML",
                "propuesta_valor": "Valor de prueba",
                "kpis": [
                    {
                        "nombre": "Eficiencia",
                        "valor_actual": "10",
                        "valor_objetivo": "20",
                        "impacto_esperado": "100%",
                    }
                ],
                "roi_indicativo": [{"nombre": "Ahorro", "valor": "$1000"}],
                "pitch_ventas": "Pitch de prueba",
            },
        )

    def test_pdf_is_well_formed(self):
        url = reverse("model:descargar_pdf", args=[self.cliente.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "application/pdf")

        pdf_bytes = response.content
        self.assertTrue(pdf_bytes.startswith(b"%PDF"))

        reader = PdfReader(io.BytesIO(pdf_bytes))
        self.assertGreaterEqual(len(reader.pages), 1)

        text = "".join(page.extract_text() or "" for page in reader.pages)
        self.assertIn("Piloto IA", text)

