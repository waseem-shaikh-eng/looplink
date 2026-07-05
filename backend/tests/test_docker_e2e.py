"""End-to-end test against the running Docker stack."""
import json
import sys
import urllib.request

BASE = "http://localhost:3000/api/v1"


def api(method, path, data=None):
    url = f"{BASE}{path}"
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(
        url, data=body, method=method,
        headers={"Content-Type": "application/json"} if body else {}
    )
    try:
        with urllib.request.urlopen(req) as resp:
            text = resp.read().decode()
            return resp.status, json.loads(text) if text else None
    except urllib.error.HTTPError as e:
        text = e.read().decode()
        return e.code, json.loads(text) if text else {"detail": str(e)}


def main():
    steps = 0

    # 1. List campaigns (empty)
    status, data = api("GET", "/campaigns")
    assert status == 200
    assert data["campaigns"] == []
    steps += 1
    print(f"{steps}. GET /campaigns (empty): OK")

    # 2. Create campaign
    status, data = api("POST", "/campaigns", {"name": "Docker E2E", "description": "Test"})
    assert status == 201
    assert data["status"] == "draft"
    assert data["version"] == 1
    cid = data["id"]
    token = data["public_token"]
    steps += 1
    print(f"{steps}. POST /campaigns: OK (status={data['status']}, version={data['version']})")

    # 3. Add offers
    offers = [
        {"type": "product_percent_discount", "parameters": {"product_id": "p1", "percent": 20}},
        {"type": "cart_fixed_discount", "parameters": {"amount": 15}},
    ]
    status, data = api("PUT", f"/campaigns/{cid}/offers", offers)
    assert status == 200
    assert len(data["offers"]) == 2
    steps += 1
    print(f"{steps}. PUT /offers: OK ({len(data['offers'])} offers)")

    # 4. Schedule
    from datetime import datetime, timedelta, timezone
    future = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
    status, data = api("POST", f"/campaigns/{cid}/schedule", {"starts_at": future, "version": 1})
    assert status == 200
    assert data["status"] == "scheduled"
    assert data["version"] == 2
    steps += 1
    print(f"{steps}. POST /schedule: OK (status={data['status']}, version={data['version']})")

    # 5. Launch
    status, data = api("POST", f"/campaigns/{cid}/launch", {"version": 2})
    assert status == 200
    assert data["status"] == "live"
    steps += 1
    print(f"{steps}. POST /launch: OK (status={data['status']})")

    # 6. Public campaign page
    status, data = api("GET", f"/c/{token}")
    assert status == 200
    assert data["status"] == "live"
    assert data["name"] == "Docker E2E"
    steps += 1
    print(f"{steps}. GET /c/{{token}}: OK (name={data['name']}, status={data['status']})")

    # 7. Enroll
    status, data = api("POST", f"/c/{token}/enroll", {"identity": "docker@test.com", "identity_type": "email"})
    assert status == 200
    assert data["already_enrolled"] is False
    assert data["id"] is not None
    eid = data["id"]
    steps += 1
    print(f"{steps}. POST /c/{{token}}/enroll: OK (id={eid[:8]}...)")

    # 8. Duplicate enrollment
    status, data = api("POST", f"/c/{token}/enroll", {"identity": "  DOCKER@TEST.COM  ", "identity_type": "email"})
    assert status == 200
    assert data["already_enrolled"] is True
    assert data["id"] == eid
    steps += 1
    print(f"{steps}. Duplicate enroll: OK (already_enrolled={data['already_enrolled']})")

    # 9. End campaign
    status, data = api("POST", f"/campaigns/{cid}/end", {"version": 3})
    assert status == 200
    assert data["status"] == "ended"
    steps += 1
    print(f"{steps}. POST /end: OK (status={data['status']}, version={data['version']})")

    # 10. Stale version (optimistic locking)
    status, data = api("POST", f"/campaigns/{cid}/end", {"version": 1})
    assert status == 409
    steps += 1
    print(f"{steps}. Stale version (409): OK")

    # 11. Distribution
    status, data = api("GET", f"/campaigns/{cid}/distribution")
    assert status == 200
    assert len(data["qr_code_base64"]) > 0
    assert data["url"].startswith("https://")
    steps += 1
    print(f"{steps}. GET /distribution: OK (qr={len(data['qr_code_base64'])} bytes)")

    # 12. Enroll on ended campaign
    status, data = api("POST", f"/c/{token}/enroll", {"identity": "new@test.com", "identity_type": "email"})
    assert status == 422
    steps += 1
    print(f"{steps}. Enroll on ended (422): OK")

    # 13. Invalid public token
    status, data = api("GET", "/c/invalid-token")
    assert status == 404
    steps += 1
    print(f"{steps}. Invalid token (404): OK")

    # 14. Launch without offers (schedule + launch with no offers)
    status, data = api("POST", "/campaigns", {"name": "No Offers"})
    cid2 = data["id"]
    future2 = (datetime.now(timezone.utc) + timedelta(days=3)).isoformat()
    status, _ = api("POST", f"/campaigns/{cid2}/schedule", {"starts_at": future2, "version": 1})
    assert status == 200
    status, data = api("POST", f"/campaigns/{cid2}/launch", {"version": 2})
    assert status == 422
    steps += 1
    print(f"{steps}. Launch w/o offers (422): OK")

    print(f"\n=== All {steps} Docker E2E tests PASSED ===")


if __name__ == "__main__":
    main()
