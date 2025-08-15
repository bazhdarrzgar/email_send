import requests
import sys
import json
from datetime import datetime, timedelta, timezone
from typing import Dict, Any

class ScheduledEmailAPITester:
    def __init__(self, base_url="https://timely-mailer.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.created_email_ids = []  # Track created emails for cleanup

    def run_test(self, name: str, method: str, endpoint: str, expected_status: int, data: Dict[Any, Any] = None) -> tuple:
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2, default=str)}")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {json.dumps(error_data, indent=2)}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test health check endpoint"""
        return self.run_test("Health Check", "GET", "api/health", 200)

    def test_root_endpoint(self):
        """Test root endpoint"""
        return self.run_test("Root Endpoint", "GET", "", 200)

    def test_schedule_email_current_time(self):
        """Test scheduling email for current time (should be sendable immediately)"""
        current_time = datetime.now(timezone.utc)
        success, response = self.run_test(
            "Schedule Email (Current Time)",
            "POST",
            "api/schedule-email",
            200,
            data={"scheduled_datetime": current_time.isoformat()}
        )
        if success and 'id' in response:
            self.created_email_ids.append(response['id'])
            return True, response
        return False, {}

    def test_schedule_email_future_time(self):
        """Test scheduling email for future time"""
        future_time = datetime.now(timezone.utc) + timedelta(hours=1)
        success, response = self.run_test(
            "Schedule Email (Future Time)",
            "POST",
            "api/schedule-email",
            200,
            data={"scheduled_datetime": future_time.isoformat()}
        )
        if success and 'id' in response:
            self.created_email_ids.append(response['id'])
            return True, response
        return False, {}

    def test_get_scheduled_emails(self):
        """Test getting all scheduled emails"""
        return self.run_test("Get Scheduled Emails", "GET", "api/scheduled-emails", 200)

    def test_check_and_send_emails(self):
        """Test manual check and send emails"""
        return self.run_test("Check and Send Emails", "POST", "api/check-send-emails", 200)

    def test_cancel_scheduled_email(self, email_id: str):
        """Test canceling a scheduled email"""
        return self.run_test(
            f"Cancel Scheduled Email ({email_id[:8]}...)",
            "DELETE",
            f"api/scheduled-emails/{email_id}",
            200
        )

    def test_cancel_nonexistent_email(self):
        """Test canceling a non-existent email"""
        fake_id = "non-existent-id-12345"
        return self.run_test(
            "Cancel Non-existent Email",
            "DELETE",
            f"api/scheduled-emails/{fake_id}",
            404
        )

    def cleanup_created_emails(self):
        """Clean up any emails created during testing"""
        print(f"\n🧹 Cleaning up {len(self.created_email_ids)} created emails...")
        for email_id in self.created_email_ids:
            try:
                url = f"{self.base_url}/api/scheduled-emails/{email_id}"
                response = requests.delete(url, timeout=5)
                if response.status_code == 200:
                    print(f"   ✅ Deleted email {email_id[:8]}...")
                else:
                    print(f"   ⚠️  Could not delete email {email_id[:8]}... (status: {response.status_code})")
            except Exception as e:
                print(f"   ❌ Error deleting email {email_id[:8]}...: {str(e)}")

def main():
    print("🚀 Starting Scheduled Email API Tests")
    print("=" * 50)
    
    tester = ScheduledEmailAPITester()
    
    try:
        # Test basic endpoints
        print("\n📋 BASIC ENDPOINT TESTS")
        print("-" * 30)
        tester.test_root_endpoint()
        tester.test_health_check()

        # Test email scheduling
        print("\n📧 EMAIL SCHEDULING TESTS")
        print("-" * 30)
        current_success, current_email = tester.test_schedule_email_current_time()
        future_success, future_email = tester.test_schedule_email_future_time()

        # Test getting scheduled emails
        print("\n📋 EMAIL RETRIEVAL TESTS")
        print("-" * 30)
        list_success, email_list = tester.test_get_scheduled_emails()

        # Test check and send functionality
        print("\n📤 EMAIL SENDING TESTS")
        print("-" * 30)
        send_success, send_result = tester.test_check_and_send_emails()

        # Test cancellation functionality
        print("\n🗑️  EMAIL CANCELLATION TESTS")
        print("-" * 30)
        
        # Test canceling non-existent email first
        tester.test_cancel_nonexistent_email()
        
        # Test canceling a real email if we have one
        if future_success and 'id' in future_email:
            cancel_success, _ = tester.test_cancel_scheduled_email(future_email['id'])
            if cancel_success:
                # Remove from cleanup list since we successfully canceled it
                if future_email['id'] in tester.created_email_ids:
                    tester.created_email_ids.remove(future_email['id'])

        # Final verification - get emails again to see current state
        print("\n🔍 FINAL VERIFICATION")
        print("-" * 30)
        tester.test_get_scheduled_emails()

    except KeyboardInterrupt:
        print("\n⚠️  Tests interrupted by user")
    except Exception as e:
        print(f"\n❌ Unexpected error during testing: {str(e)}")
    finally:
        # Cleanup any remaining emails
        tester.cleanup_created_emails()

    # Print final results
    print("\n" + "=" * 50)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 50)
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Tests Failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%" if tester.tests_run > 0 else "No tests run")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed - check logs above")
        return 1

if __name__ == "__main__":
    sys.exit(main())