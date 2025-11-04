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


class ClientDiagnosticoApiTests(TestCase):
    def setUp(self):
        self.catalog = {
            'categories': [
                {
                    'categoryName': 'Cat',
                    'subcategories': [
                        {
                            'subcategoryName': 'Sub',
                            'projects': [
                                {
                                    'id': 7,
                                    'projectName': 'Proyecto Coincidente',
                                    'description': 'Descripción desde catálogo',
                                    'technology': 'IA',
                                    'kpis': [{'name': 'KPI', 'value': '10'}],
                                    'valueProposition': 'Valor catálogo',
                                    'salesPitch': 'Pitch catálogo',
                                    'monthlyROI': [{'name': 'ROI', 'value': '100'}],
                                }
                            ],
                        }
                    ],
                }
            ]
        }
        ProyectoCatalog.objects.create(datos_catalogo=self.catalog, version=1)
        self.cliente = Cliente.objects.create(
            nombre_cliente="Cliente Discovery",
            diagnostico_json={
                'colaboracion_propuesta': [
                    'Proyecto Coincidente',
                    {
                        'projectName': 'Proyecto Desconocido',
                        'description': 'Generado desde discovery',
                        'technology': 'LLM',
                        'valueProposition': 'Valor discovery',
                        'salesPitch': 'Pitch discovery',
                        'kpis': [{'name': 'KPI custom', 'value': '5'}],
                        'monthlyROI': [{'name': 'ROI custom', 'value': '50'}],
                    },
                ]
            }
        )

    def test_api_enriches_colaboracion_propuesta(self):
        url = reverse('model:api_get_client_diagnostico', args=[self.cliente.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)

        data = response.json()
        propuestas = data.get('colaboracion_propuesta')
        self.assertEqual(len(propuestas), 2)

        matched = propuestas[0]
        self.assertEqual(matched['projectName'], 'Proyecto Coincidente')
        self.assertEqual(matched['id'], 7)
        self.assertEqual(matched['categoryName'], 'Cat')
        self.assertEqual(matched['subcategoryName'], 'Sub')
        self.assertEqual(matched['source'], 'catalog')
        self.assertEqual(matched['description'], 'Descripción desde catálogo')
        self.assertEqual(matched['technology'], 'IA')
        self.assertEqual(matched['valueProposition'], 'Valor catálogo')
        self.assertEqual(matched['salesPitch'], 'Pitch catálogo')
        self.assertEqual(matched['kpis'][0]['name'], 'KPI')
        self.assertEqual(matched['monthlyROI'][0]['value'], '100')

        custom = propuestas[1]
        self.assertEqual(custom['projectName'], 'Proyecto Desconocido')
        self.assertTrue(custom['id'].startswith('suggested_'))
        self.assertEqual(custom['categoryName'], 'Otros')
        self.assertEqual(custom['subcategoryName'], 'Otro')
        self.assertEqual(custom['source'], 'custom')
        self.assertEqual(custom['description'], 'Generado desde discovery')
        self.assertEqual(custom['technology'], 'LLM')
        self.assertEqual(custom['valueProposition'], 'Valor discovery')
        self.assertEqual(custom['salesPitch'], 'Pitch discovery')
        self.assertEqual(custom['kpis'][0]['name'], 'KPI custom')
        self.assertEqual(custom['monthlyROI'][0]['value'], '50')

