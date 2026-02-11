from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
import io
import joblib
import os

app = FastAPI(title="Churn Prediction API")

# ---------------- CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Load Model ----------------
MODEL_PATH = "model.pkl"

if not os.path.exists(MODEL_PATH):
    raise RuntimeError("❌ ไม่พบไฟล์ model.pkl ในโฟลเดอร์ backend")

model = joblib.load(MODEL_PATH)


# ---------------- Health Check ----------------
@app.get("/")
def root():
    return {"message": "Churn API is running 🚀"}


# ---------------- Predict Endpoint ----------------
@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    try:
        contents = await file.read()

        # รองรับ csv และ xlsx
        if file.filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(contents))
        elif file.filename.endswith(".xlsx"):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            raise HTTPException(status_code=400, detail="รองรับเฉพาะไฟล์ .csv หรือ .xlsx")

        if df.empty:
            raise HTTPException(status_code=400, detail="ไฟล์ไม่มีข้อมูล")

        # เก็บ Contract ไว้
        contract_col = df["Contract"] if "Contract" in df.columns else None

        # เตรียมข้อมูลเข้า model
        X = df.copy()

        if "customerID" in X.columns:
            X = X.drop("customerID", axis=1)

        # One-hot encoding
        X = pd.get_dummies(X)

        # ป้องกัน error feature ไม่ครบ
        if hasattr(model, "feature_names_in_"):
            model_columns = model.feature_names_in_

            for col in model_columns:
                if col not in X.columns:
                    X[col] = 0

            X = X[model_columns]

        # Predict
        predictions = model.predict(X)

        df["prediction"] = predictions

        total = len(df)
        churn_count = int(np.sum(predictions))
        non_churn_count = total - churn_count
        churn_rate = round((churn_count / total) * 100, 2)

        # วิเคราะห์ตาม Contract
        risk_by_contract = []

        if contract_col is not None:
            grouped = df.groupby("Contract")["prediction"].mean() * 100
            grouped = grouped.sort_values(ascending=False)

            for contract, rate in grouped.items():
                risk_by_contract.append({
                    "type": contract,
                    "churn_rate": round(float(rate), 2)
                })

        return {
            "total_customers": total,
            "churn_count": churn_count,
            "non_churn_count": non_churn_count,
            "churn_rate": churn_rate,
            "risk_by_contract": risk_by_contract
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
