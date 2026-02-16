#!/usr/bin/env python3
"""
Backend API Testing for Chez Loman Restaurant Website
Tests all API endpoints for functionality and data integrity
"""

import requests
import sys
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any

class ChezLomanAPITester:
    def __init__(self, base_url="https://loman-restaurant.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name: str, success: bool, details: str = ""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}: PASSED")
        else:
            print(f"❌ {name}: FAILED - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def make_request(self, method: str, endpoint: str, data: Dict = None) -> tuple:
        """Make HTTP request and return (success, response_data, status_code)"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)
            else:
                return False, {}, 0
            
            try:
                response_data = response.json()
            except:
                response_data = {"text": response.text}
            
            return response.status_code < 400, response_data, response.status_code
            
        except requests.exceptions.RequestException as e:
            return False, {"error": str(e)}, 0

    def test_root_endpoint(self):
        """Test API root endpoint"""
        success, data, status = self.make_request('GET', '')
        expected_message = "Bienvenue chez Loman API"
        
        if success and data.get('message') == expected_message:
            self.log_test("API Root Endpoint", True)
            return True
        else:
            self.log_test("API Root Endpoint", False, f"Status: {status}, Data: {data}")
            return False

    def test_restaurant_info(self):
        """Test restaurant info endpoint"""
        success, data, status = self.make_request('GET', 'info')
        
        if success and data.get('name') == "Chez Loman":
            self.log_test("Restaurant Info", True)
            return True
        else:
            self.log_test("Restaurant Info", False, f"Status: {status}, Data: {data}")
            return False

    def test_seed_data(self):
        """Test seed data endpoint"""
        success, data, status = self.make_request('POST', 'seed')
        
        if success and ("seeded" in data.get('message', '').lower() or "already" in data.get('message', '').lower()):
            self.log_test("Seed Data", True)
            return True
        else:
            self.log_test("Seed Data", False, f"Status: {status}, Data: {data}")
            return False

    def test_menu_endpoints(self):
        """Test menu-related endpoints"""
        # Test get all menu items
        success, data, status = self.make_request('GET', 'menu')
        if not success or not isinstance(data, list):
            self.log_test("Get All Menu Items", False, f"Status: {status}, Data: {data}")
            return False
        
        self.log_test("Get All Menu Items", True, f"Found {len(data)} items")
        
        # Test get featured items
        success, data, status = self.make_request('GET', 'menu/featured')
        if success and isinstance(data, list):
            self.log_test("Get Featured Menu Items", True, f"Found {len(data)} featured items")
        else:
            self.log_test("Get Featured Menu Items", False, f"Status: {status}")
        
        # Test category filtering
        categories = ["Plats Ivoiriens", "Grillades", "Spécialités", "Boissons"]
        for category in categories:
            success, data, status = self.make_request('GET', f'menu?category={category}')
            if success and isinstance(data, list):
                self.log_test(f"Menu Category Filter: {category}", True, f"Found {len(data)} items")
            else:
                self.log_test(f"Menu Category Filter: {category}", False, f"Status: {status}")

        return True

    def test_daily_menu_endpoints(self):
        """Test daily menu endpoints"""
        # Test get current daily menu
        success, data, status = self.make_request('GET', 'daily-menu')
        if success:
            self.log_test("Get Current Daily Menu", True)
        else:
            self.log_test("Get Current Daily Menu", False, f"Status: {status}, Data: {data}")
        
        # Test get all daily menus
        success, data, status = self.make_request('GET', 'daily-menus')
        if success and isinstance(data, list):
            self.log_test("Get All Daily Menus", True, f"Found {len(data)} menus")
        else:
            self.log_test("Get All Daily Menus", False, f"Status: {status}")
        
        # Test create daily menu
        tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        test_menu = {
            "date": tomorrow,
            "items": [
                "Test Attièkè Poisson - 3500 FCFA",
                "Test Foutou Sauce - 3000 FCFA"
            ],
            "special_message": "Test menu créé par l'API"
        }
        
        success, data, status = self.make_request('POST', 'daily-menu', test_menu)
        if success and data.get('id'):
            menu_id = data['id']
            self.log_test("Create Daily Menu", True, f"Created menu ID: {menu_id}")
            
            # Test delete the created menu
            success, data, status = self.make_request('DELETE', f'daily-menu/{menu_id}')
            if success:
                self.log_test("Delete Daily Menu", True)
            else:
                self.log_test("Delete Daily Menu", False, f"Status: {status}")
        else:
            self.log_test("Create Daily Menu", False, f"Status: {status}, Data: {data}")

        return True

    def test_gallery_endpoints(self):
        """Test gallery endpoints"""
        # Test get all gallery photos
        success, data, status = self.make_request('GET', 'gallery')
        if success and isinstance(data, list):
            self.log_test("Get All Gallery Photos", True, f"Found {len(data)} photos")
        else:
            self.log_test("Get All Gallery Photos", False, f"Status: {status}")
            return False
        
        # Test category filtering
        categories = ["restaurant", "plats", "clients", "ambiance"]
        for category in categories:
            success, data, status = self.make_request('GET', f'gallery?category={category}')
            if success and isinstance(data, list):
                self.log_test(f"Gallery Category Filter: {category}", True, f"Found {len(data)} photos")
            else:
                self.log_test(f"Gallery Category Filter: {category}", False, f"Status: {status}")
        
        # Test add photo
        test_photo = {
            "image_url": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400",
            "caption": "Test photo from API",
            "category": "restaurant"
        }
        
        success, data, status = self.make_request('POST', 'gallery', test_photo)
        if success and data.get('id'):
            photo_id = data['id']
            self.log_test("Add Gallery Photo", True, f"Created photo ID: {photo_id}")
            
            # Test delete the created photo
            success, data, status = self.make_request('DELETE', f'gallery/{photo_id}')
            if success:
                self.log_test("Delete Gallery Photo", True)
            else:
                self.log_test("Delete Gallery Photo", False, f"Status: {status}")
        else:
            self.log_test("Add Gallery Photo", False, f"Status: {status}, Data: {data}")

        return True

    def test_reviews_endpoints(self):
        """Test reviews endpoints"""
        # Test get all reviews
        success, data, status = self.make_request('GET', 'reviews')
        if success and isinstance(data, list):
            self.log_test("Get All Reviews", True, f"Found {len(data)} reviews")
        else:
            self.log_test("Get All Reviews", False, f"Status: {status}")
            return False
        
        # Test create review
        test_review = {
            "author": "Test User API",
            "rating": 5,
            "comment": "Excellent test review from API testing!"
        }
        
        success, data, status = self.make_request('POST', 'reviews', test_review)
        if success and data.get('id'):
            self.log_test("Create Review", True, f"Created review ID: {data['id']}")
        else:
            self.log_test("Create Review", False, f"Status: {status}, Data: {data}")

        return True

    def test_videos_endpoints(self):
        """Test videos endpoints"""
        # Test get all videos
        success, data, status = self.make_request('GET', 'videos')
        if success and isinstance(data, list):
            self.log_test("Get All Videos", True, f"Found {len(data)} videos")
        else:
            self.log_test("Get All Videos", False, f"Status: {status}")
            return False
        
        # Test get active videos only
        success, data, status = self.make_request('GET', 'videos?active_only=true')
        if success and isinstance(data, list):
            self.log_test("Get Active Videos Only", True, f"Found {len(data)} active videos")
        else:
            self.log_test("Get Active Videos Only", False, f"Status: {status}")
        
        # Test create video
        test_video = {
            "title": "Test Video from API",
            "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "video_type": "youtube",
            "description": "Test video created by API testing"
        }
        
        success, data, status = self.make_request('POST', 'videos', test_video)
        if success and data.get('id'):
            video_id = data['id']
            self.log_test("Create Video", True, f"Created video ID: {video_id}")
            
            # Test update video (toggle active status)
            success, data, status = self.make_request('PUT', f'videos/{video_id}?is_active=false')
            if success:
                self.log_test("Update Video Status", True)
            else:
                self.log_test("Update Video Status", False, f"Status: {status}")
            
            # Test delete the created video
            success, data, status = self.make_request('DELETE', f'videos/{video_id}')
            if success:
                self.log_test("Delete Video", True)
            else:
                self.log_test("Delete Video", False, f"Status: {status}")
        else:
            self.log_test("Create Video", False, f"Status: {status}, Data: {data}")

        return True

    def test_promotions_endpoints(self):
        """Test promotions endpoints"""
        # Test get all promotions
        success, data, status = self.make_request('GET', 'promotions')
        if success and isinstance(data, list):
            self.log_test("Get All Promotions", True, f"Found {len(data)} promotions")
        else:
            self.log_test("Get All Promotions", False, f"Status: {status}")
            return False
        
        # Test get active promotions only
        success, data, status = self.make_request('GET', 'promotions?active_only=true')
        if success and isinstance(data, list):
            self.log_test("Get Active Promotions Only", True, f"Found {len(data)} active promotions")
        else:
            self.log_test("Get Active Promotions Only", False, f"Status: {status}")
        
        # Test create promotion
        tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        next_week = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
        
        test_promotion = {
            "title": "Test Promotion from API",
            "description": "This is a test promotion created by API testing",
            "promo_type": "banner",
            "start_date": tomorrow,
            "end_date": next_week
        }
        
        success, data, status = self.make_request('POST', 'promotions', test_promotion)
        if success and data.get('id'):
            promo_id = data['id']
            self.log_test("Create Promotion", True, f"Created promotion ID: {promo_id}")
            
            # Test update promotion
            update_data = {
                "title": "Updated Test Promotion",
                "is_active": False
            }
            success, data, status = self.make_request('PUT', f'promotions/{promo_id}', update_data)
            if success:
                self.log_test("Update Promotion", True)
            else:
                self.log_test("Update Promotion", False, f"Status: {status}")
            
            # Test delete the created promotion
            success, data, status = self.make_request('DELETE', f'promotions/{promo_id}')
            if success:
                self.log_test("Delete Promotion", True)
            else:
                self.log_test("Delete Promotion", False, f"Status: {status}")
        else:
            self.log_test("Create Promotion", False, f"Status: {status}, Data: {data}")

        return True

    def test_menu_item_management(self):
        """Test menu item management endpoints"""
        # First get existing menu items
        success, data, status = self.make_request('GET', 'menu')
        if not success or not isinstance(data, list) or len(data) == 0:
            self.log_test("Menu Item Management - Get Items", False, "No menu items found")
            return False
        
        # Test updating a menu item (toggle availability and featured status)
        test_item = data[0]  # Use first item for testing
        item_id = test_item['id']
        
        # Test toggle availability
        current_availability = test_item.get('is_available', True)
        success, data, status = self.make_request('PUT', f'menu/{item_id}?is_available={not current_availability}')
        if success:
            self.log_test("Toggle Menu Item Availability", True)
        else:
            self.log_test("Toggle Menu Item Availability", False, f"Status: {status}")
        
        # Test toggle featured status
        current_featured = test_item.get('is_featured', False)
        success, data, status = self.make_request('PUT', f'menu/{item_id}?is_featured={not current_featured}')
        if success:
            self.log_test("Toggle Menu Item Featured Status", True)
        else:
            self.log_test("Toggle Menu Item Featured Status", False, f"Status: {status}")
        
        # Restore original values
        success, data, status = self.make_request('PUT', f'menu/{item_id}?is_available={current_availability}&is_featured={current_featured}')
        if success:
            self.log_test("Restore Menu Item Original Status", True)
        else:
            self.log_test("Restore Menu Item Original Status", False, f"Status: {status}")

        return True

    def test_error_handling(self):
        """Test error handling for invalid requests"""
        # Test invalid menu item deletion
        success, data, status = self.make_request('DELETE', 'menu/invalid-id')
        if status == 404:
            self.log_test("Error Handling - Invalid Menu Delete", True)
        else:
            self.log_test("Error Handling - Invalid Menu Delete", False, f"Expected 404, got {status}")
        
        # Test invalid daily menu deletion
        success, data, status = self.make_request('DELETE', 'daily-menu/invalid-id')
        if status == 404:
            self.log_test("Error Handling - Invalid Daily Menu Delete", True)
        else:
            self.log_test("Error Handling - Invalid Daily Menu Delete", False, f"Expected 404, got {status}")
        
        # Test invalid photo deletion
        success, data, status = self.make_request('DELETE', 'gallery/invalid-id')
        if status == 404:
            self.log_test("Error Handling - Invalid Photo Delete", True)
        else:
            self.log_test("Error Handling - Invalid Photo Delete", False, f"Expected 404, got {status}")

        return True

    def run_all_tests(self):
        """Run all API tests"""
        print("🧪 Starting Chez Loman API Tests...")
        print(f"🌐 Testing API at: {self.api_url}")
        print("=" * 60)
        
        # Basic connectivity tests
        if not self.test_root_endpoint():
            print("❌ API is not accessible. Stopping tests.")
            return False
        
        self.test_restaurant_info()
        self.test_seed_data()
        
        # Core functionality tests
        self.test_menu_endpoints()
        self.test_daily_menu_endpoints()
        self.test_gallery_endpoints()
        self.test_reviews_endpoints()
        self.test_videos_endpoints()
        self.test_promotions_endpoints()
        self.test_menu_item_management()
        
        # Error handling tests
        self.test_error_handling()
        
        # Print summary
        print("=" * 60)
        print(f"📊 Test Summary:")
        print(f"   Total Tests: {self.tests_run}")
        print(f"   Passed: {self.tests_passed}")
        print(f"   Failed: {self.tests_run - self.tests_passed}")
        print(f"   Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print("⚠️  Some tests failed. Check the details above.")
            return False

def main():
    """Main test execution"""
    tester = ChezLomanAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())