"""
DeepSeek AI Service for Restaurant Analytics
"""
from openai import AsyncOpenAI
import os
import json
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

# DeepSeek API Configuration
DEEPSEEK_API_KEY = os.environ.get('DEEPSEEK_API_KEY', '')
DEEPSEEK_BASE_URL = "https://api.deepseek.com"

class DeepSeekService:
    def __init__(self):
        self.client = AsyncOpenAI(
            api_key=DEEPSEEK_API_KEY,
            base_url=DEEPSEEK_BASE_URL
        ) if DEEPSEEK_API_KEY else None
        self.model = "deepseek-chat"
    
    def is_configured(self) -> bool:
        return self.client is not None and DEEPSEEK_API_KEY != ''
    
    async def generate_business_insights(
        self,
        sales_data: Dict[str, Any],
        restaurant_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate actionable business insights from sales data"""
        
        if not self.is_configured():
            return self._get_mock_insights(sales_data)
        
        system_prompt = """Tu es un expert analyste business pour restaurants africains haut de gamme.
        Analyse les données de ventes et opérationnelles pour générer des insights clairs et actionnables.
        Réponds toujours en français. Sois concis et pratique."""
        
        user_prompt = f"""Analyse ces données du restaurant et donne des insights:
        
        Données de ventes:
        {json.dumps(sales_data, indent=2, default=str)}
        
        Contexte restaurant:
        {json.dumps(restaurant_context, indent=2, default=str)}
        
        Réponds en JSON avec ce format:
        {{
            "resume": "résumé en 2 phrases",
            "points_cles": ["point1", "point2", "point3"],
            "opportunites": ["opportunité1", "opportunité2"],
            "recommandations": ["action1", "action2", "action3"],
            "alertes": ["alerte si nécessaire"],
            "score_sante": 85
        }}"""
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
                max_tokens=1500
            )
            
            content = response.choices[0].message.content
            # Extract JSON from response
            json_start = content.find("{")
            json_end = content.rfind("}") + 1
            if json_start != -1 and json_end > json_start:
                return json.loads(content[json_start:json_end])
            return {"error": "Could not parse response", "raw": content}
            
        except Exception as e:
            return {"error": str(e), "fallback": self._get_mock_insights(sales_data)}
    
    async def forecast_sales(
        self,
        historical_data: List[Dict[str, Any]],
        period: str = "7_jours"
    ) -> Dict[str, Any]:
        """Generate sales forecasts"""
        
        if not self.is_configured():
            return self._get_mock_forecast()
        
        system_prompt = """Tu es un expert en prévisions de ventes pour restaurants.
        Analyse les données historiques et génère des prévisions réalistes.
        Réponds en français avec des chiffres précis."""
        
        user_prompt = f"""Basé sur ces données historiques, prévois les ventes pour les {period} prochains:
        
        Historique:
        {json.dumps(historical_data[-14:], indent=2, default=str)}
        
        Réponds en JSON:
        {{
            "previsions": [
                {{"date": "2025-02-16", "revenu_prevu": 450000, "commandes_prevues": 85}},
                ...
            ],
            "tendance": "hausse/stable/baisse",
            "confiance": 75,
            "facteurs": ["facteur1", "facteur2"],
            "conseil": "conseil principal"
        }}"""
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.5,
                max_tokens=1500
            )
            
            content = response.choices[0].message.content
            json_start = content.find("{")
            json_end = content.rfind("}") + 1
            if json_start != -1 and json_end > json_start:
                return json.loads(content[json_start:json_end])
            return self._get_mock_forecast()
            
        except Exception as e:
            return {"error": str(e), "fallback": self._get_mock_forecast()}
    
    async def chat_assistant(
        self,
        message: str,
        context: Dict[str, Any]
    ) -> str:
        """AI Assistant for restaurant management questions"""
        
        if not self.is_configured():
            return "L'assistant IA n'est pas configuré. Veuillez ajouter votre clé API DeepSeek."
        
        system_prompt = """Tu es l'assistant IA du restaurant "Chez Loman", un restaurant ivoirien haut de gamme à Abidjan.
        Tu aides le gérant avec:
        - Analyse des ventes et performances
        - Conseils pour améliorer le service
        - Gestion des stocks et commandes
        - Stratégies marketing
        - Optimisation des coûts
        
        Réponds toujours en français, de manière professionnelle mais chaleureuse.
        Utilise les données du contexte pour personnaliser tes réponses."""
        
        user_prompt = f"""Contexte actuel du restaurant:
        {json.dumps(context, indent=2, default=str)}
        
        Question du gérant: {message}"""
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
                max_tokens=1000
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            return f"Erreur de l'assistant: {str(e)}"
    
    def _get_mock_insights(self, sales_data: Dict[str, Any]) -> Dict[str, Any]:
        """Return mock insights when API is not configured"""
        return {
            "resume": "Le restaurant montre une bonne performance globale. Les plats signatures restent les plus populaires.",
            "points_cles": [
                "Chiffre d'affaires en hausse de 12% cette semaine",
                "Le poulet braisé reste le plat le plus commandé",
                "Pic d'activité entre 19h et 21h"
            ],
            "opportunites": [
                "Développer les commandes à emporter",
                "Créer des menus spéciaux weekend"
            ],
            "recommandations": [
                "Augmenter le stock de poulet pour le weekend",
                "Proposer une promotion sur les boissons en semaine",
                "Former le personnel sur les nouvelles recettes"
            ],
            "alertes": [
                "Stock de bissap bientôt épuisé"
            ],
            "score_sante": 78
        }
    
    def _get_mock_forecast(self) -> Dict[str, Any]:
        """Return mock forecast when API is not configured"""
        from datetime import timedelta
        base_date = datetime.now(timezone.utc)
        
        return {
            "previsions": [
                {
                    "date": (base_date + timedelta(days=i)).strftime("%Y-%m-%d"),
                    "revenu_prevu": 350000 + (i * 15000) + (50000 if (base_date + timedelta(days=i)).weekday() >= 5 else 0),
                    "commandes_prevues": 70 + (i * 3) + (20 if (base_date + timedelta(days=i)).weekday() >= 5 else 0)
                }
                for i in range(1, 8)
            ],
            "tendance": "hausse",
            "confiance": 72,
            "facteurs": [
                "Weekend à venir (augmentation prévue)",
                "Météo favorable",
                "Pas d'événement majeur concurrentiel"
            ],
            "conseil": "Préparez plus de stock pour le weekend, particulièrement les grillades."
        }


# Global instance
ai_service = DeepSeekService()
