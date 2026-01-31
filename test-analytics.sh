#!/bin/bash

echo "🎯 TESTANDO TODOS OS ENDPOINTS ANALYTICS"
echo "=========================================="
echo ""

BASE_URL="http://localhost:3000/api/analytics"

echo "1️⃣ Companies with Leads Count (LEFT JOIN + COUNT)"
curl -s "$BASE_URL/companies-with-leads" | jq '.'
echo ""
echo "---"
echo ""

echo "2️⃣ User Performance Report (Múltiplos JOINs)"
curl -s "$BASE_URL/user-performance" | jq '.'
echo ""
echo "---"
echo ""

echo "3️⃣ Leads by Status with Company Info (CTE)"
curl -s "$BASE_URL/leads-by-status" | jq '.'
echo ""
echo "---"
echo ""

echo "4️⃣ Top Performing Companies (Subqueries)"
curl -s "$BASE_URL/top-companies?limit=10" | jq '.'
echo ""
echo "---"
echo ""

echo "5️⃣ Lead Distribution Analysis (CASE + Window Functions)"
curl -s "$BASE_URL/lead-distribution" | jq '.'
echo ""
echo "---"
echo ""

echo "6️⃣ Monthly Lead Trend (CTE + Window Functions)"
curl -s "$BASE_URL/monthly-trend" | jq '.'
echo ""
echo "---"
echo ""

echo "✅ TODOS OS TESTES CONCLUÍDOS!"
