# encoding: iso-8859-1
import io
import json
from unittest.mock import MagicMock, patch

from django.test import TestCase
from django.urls import reverse

from pypdf import PdfReader

from .models import Cliente, ProyectoCatalog


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
        

class AiSearchProjectsTests(TestCase):
    def setUp(self):
        catalog = {
            'categories': [
                {
                    'categoryName': 'Cat',
                    'subcategories': [
                        {
                            'subcategoryName': 'Sub',
                            'projects': [
                                {
                                    'id': 1,
                                    'projectName': 'Proyecto X',
                                    'description': 'Desc X',
                                    'technology': 'LLM, RPA, Clasificación IA, Dashboard',
                                    'kpis': [{'name': 'KPI1', 'value': '10'}],
                                    'valueProposition': 'Value Prop',
                                    'salesPitch': 'Sales Pitch',
                                    'monthlyROI': [{'name': 'ROI1', 'value': '1000'}],
                                }
                            ]
                        }
                    ]
                }
            ]
        }
        ProyectoCatalog.objects.create(datos_catalogo=catalog, version=1)

    @patch('openai.OpenAI')
    def test_ai_search_returns_full_data(self, mock_openai):
        mock_client = MagicMock()
        mock_openai.return_value = mock_client
        mock_resp = MagicMock()
        mock_resp.choices = [
            MagicMock(message=MagicMock(content=json.dumps({'projects': [{'projectName': 'Proyecto X'}]})))
        ]
        mock_client.chat.completions.create.return_value = mock_resp

        response = self.client.post(
            reverse('model:api_ai_search_projects'),
            data=json.dumps({'prompt': 'Buscar'}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        project = response.json()['projects'][0]
        self.assertEqual(project['projectName'], 'Proyecto X')
        self.assertEqual(project['description'], 'Desc X')
        self.assertEqual(project['technology'], 'LLM, RPA, Clasificación IA, Dashboard')
        self.assertEqual(project['valueProposition'], 'Value Prop')
        self.assertEqual(project['salesPitch'], 'Sales Pitch')
        self.assertEqual(project['kpis'][0]['name'], 'KPI1')
        self.assertEqual(project['kpis'][0]['value'], '10')
        self.assertEqual(project['monthlyROI'][0]['name'], 'ROI1')
        self.assertEqual(project['monthlyROI'][0]['value'], '1000')

