"""
predict.py
역할: 학습된 모델(.h5)을 불러와 새 데이터를 입력받아 예측을 수행합니다.
현재는 sample_data.csv에서 일부 샘플을 불러와 예측합니다.
"""

import pandas as pd
import tensorflow as tf
from sklearn.preprocessing import MinMaxScaler

# 예측할 입력 데이터 준비
data = pd.read_csv("ai/data/sample_data.csv")
X = data.drop("time_to_wake", axis=1)  # 실제 프로젝트에서는 새 데이터로 대체

# 입력값 스케일링 (학습 시 사용한 방법과 동일하게)
scaler = MinMaxScaler()
X_scaled = scaler.fit_transform(X)

# 학습된 모델 불러오기
model = tf.keras.models.load_model("ai/scripts/alarm_model.h5")

# 예측 실행
predictions = model.predict(X_scaled)

# 예측 결과 출력
for i, pred in enumerate(predictions[:5]):
    minutes = int(pred[0])
    hh = minutes // 60
    mm = minutes % 60
    print(f"샘플 {i+1} 예측 결과: {hh:02d}:{mm:02d}")
