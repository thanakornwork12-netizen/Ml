import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
import joblib

# 1. Load Data
df = pd.read_csv("WA_Fn-UseC_-Telco-Customer-Churn.csv")

# 2. Data Cleaning
if "customerID" in df.columns:
    df.drop("customerID", axis=1, inplace=True)

df["TotalCharges"] = pd.to_numeric(df["TotalCharges"], errors="coerce")
df["TotalCharges"] = df["TotalCharges"].fillna(df["TotalCharges"].median())

# 3. Encoding (ใช้ Get Dummies ให้เหมือนกันทั้งระบบ)
X = df.drop("Churn", axis=1)
y = df["Churn"].apply(lambda x: 1 if x == "Yes" else 0)

X = pd.get_dummies(X)
model_columns = list(X.columns) # เก็บรายชื่อ column ไว้

# 4. Split Data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 5. Training (เลือกใช้ Random Forest เป็นหลัก หรือสลับเป็น LogisticRegression ได้)
model = RandomForestClassifier(n_estimators=100, random_state=42)
# model = LogisticRegression(max_iter=1000) # ปลดคอมเมนต์ถ้าอยากใช้ Linear

model.fit(X_train, y_train)

# 6. Save Model และ Columns
joblib.dump(model, "model.pkl")
joblib.dump(model_columns, "model_columns.pkl")

print(f"✅ Training Complete. Accuracy: {accuracy_score(y_test, model.predict(X_test)):.4f}")
print("💾 Files saved: model.pkl, model_columns.pkl")