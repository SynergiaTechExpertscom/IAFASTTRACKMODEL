# encoding: iso-8859-1
import io
import json
import subprocess
import textwrap
from unittest.mock import MagicMock, patch

from django.test import TestCase
from django.urls import reverse
from django.contrib.staticfiles import finders

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

    def test_legacy_string_diagnostico_is_normalised(self):
        legacy_payload = json.dumps({
            'colaboracion_propuesta': [
                'Proyecto Coincidente',
            ]
        })
        legacy_client = Cliente.objects.create(
            nombre_cliente="Cliente Legacy",
            diagnostico_json=legacy_payload,
        )

        url = reverse('model:api_get_client_diagnostico', args=[legacy_client.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)

        data = response.json()
        propuestas = data.get('colaboracion_propuesta')
        self.assertIsInstance(propuestas, list)
        self.assertEqual(len(propuestas), 1)
        self.assertEqual(propuestas[0]['projectName'], 'Proyecto Coincidente')

    def test_catalog_json_string_is_parsed(self):
        ProyectoCatalog.objects.create(
            datos_catalogo=json.dumps(self.catalog),
            version=2,
        )

        url = reverse('model:api_get_client_diagnostico', args=[self.cliente.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)

        data = response.json()
        propuestas = data.get('colaboracion_propuesta')
        self.assertEqual(len(propuestas), 2)
        matched = propuestas[0]
        self.assertEqual(matched['id'], 7)


class ProjectCatalogApiTests(TestCase):
    def test_fallback_catalog_is_served_when_database_is_empty(self):
        response = self.client.get(reverse('model:api_get_project_catalog'))

        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertIn('categories', data)
        self.assertTrue(data['categories'], 'El catálogo de fallback debe contener categorías')
        first_category = data['categories'][0]
        self.assertIn('subcategories', first_category)
        self.assertTrue(first_category['subcategories'], 'El catálogo de fallback debe incluir subcategorías con proyectos')

    def test_catalog_json_string_is_returned_as_dict(self):
        ProyectoCatalog.objects.create(
            datos_catalogo=json.dumps({'categories': []}),
            version=1,
        )
        response = self.client.get(reverse('model:api_get_project_catalog'))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, dict)
        self.assertIn('categories', data)

    def test_staticfiles_finder_can_locate_catalog(self):
        catalog_path = finders.find('proyectos.json')
        self.assertIsNotNone(catalog_path, 'El archivo proyectos.json debe estar disponible como recurso estático')

        if isinstance(catalog_path, (list, tuple)):
            catalog_path = catalog_path[0]

        with open(catalog_path, encoding='utf-8') as catalog_file:
            data = json.load(catalog_file)

        self.assertIn('categories', data)
        self.assertGreater(len(data['categories']), 0)


class SuggestedSelectionJsTests(TestCase):
    def test_suggested_projects_assign_ids_for_selection(self):
        script = textwrap.dedent(
            """
            const fs = require('fs');
            const fileContent = fs.readFileSync('model/static/model/app.js', 'utf8');
            const match = fileContent.match(/clientData\\.colaboracion_propuesta\\.forEach\\(\\(proj, idx\\) => \\{[\\s\\S]*?\\}\\);/);
            if (!match) {
                throw new Error('No se encontró el bloque de sugeridos en app.js');
            }

            const clientData = {
                colaboracion_propuesta: [
                    { projectName: 'Proyecto sin ID', categoryName: 'Categoría Demo', subcategoryName: 'Sub Demo' }
                ]
            };
            const grouped = {};

            function generateSafeId(str) {
                if (typeof str !== 'string') {
                    return 'invalid_id_' + Math.random().toString(36).substring(2, 9);
                }
                return str.toLowerCase().replace(/[^a-z0-9_]/g, '_');
            }

            const runner = new Function('clientData', 'grouped', 'generateSafeId', match[0]);
            runner(clientData, grouped, generateSafeId);

            const updated = clientData.colaboracion_propuesta[0];
            if (!updated || !updated.id) {
                throw new Error('La sugerencia no recibió un ID persistente.');
            }
            const assignedId = updated.id;
            const groupedEntry = grouped['Categoría Demo'] && grouped['Categoría Demo']['Sub Demo'];
            if (!groupedEntry || groupedEntry[0].id !== assignedId) {
                throw new Error('El ID asignado no se propagó al catálogo agrupado.');
            }

            console.log(JSON.stringify({ assignedId }));
            """
        )

        result = subprocess.run(
            ['node', '-e', script],
            capture_output=True,
            text=True,
            check=True,
        )

        payload = json.loads(result.stdout.strip())
        self.assertTrue(payload['assignedId'])
