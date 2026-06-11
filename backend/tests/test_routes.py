import unittest
from collections import defaultdict

from main import app


class RouteRegistrationTest(unittest.TestCase):
    def test_method_and_path_pairs_are_unique(self):
        routes = defaultdict(list)
        for route in app.routes:
            for method in route.methods or []:
                if method not in {"HEAD", "OPTIONS"}:
                    routes[(method, route.path)].append(route.endpoint.__name__)

        duplicates = {key: endpoints for key, endpoints in routes.items() if len(endpoints) > 1}

        self.assertEqual(duplicates, {}, f"duplicate routes shadow handlers: {duplicates}")


if __name__ == "__main__":
    unittest.main()
