"""
train_model.py
역할: 주어진 sample_data.csv를 불러와 딥러닝 모델을 학습시키고 .h5 파일로 저장합니다.
팀원들이 이해할 수 있도록 주요 단계별로 설명을 달았습니다.
"""

import pandas as pd
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler

# 데이터 로드 (반드시 'target'이라는 정답 컬럼이 존재해야 함)
data = pd.read_csv("ai/data/sample_data.csv")

# 입력(X) / 출력(y) 나누기
X = data.drop("time_to_wake", axis=1)
y_raw = data["time_to_wake"]
# HH:MM 형식을 분 단위 정수로 변환 (예: '07:30' → 450)
y = y_raw.apply(lambda t: int(t.split(":")[0]) * 60 + int(t.split(":")[1]))


# 정규화 (0~1 범위로 스케일링)
scaler = MinMaxScaler()
X_scaled = scaler.fit_transform(X)

# 훈련셋 / 검증셋 분할 (80% 학습, 20% 검증)
X_train, X_val, y_train, y_val = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

# 간단한 DNN 모델 정의
model = tf.keras.Sequential([
    tf.keras.layers.Dense(32, activation='relu', input_shape=(X_train.shape[1],)),
    tf.keras.layers.Dense(16, activation='relu'),
    tf.keras.layers.Dense(1)  # 회귀 문제 (분류일 경우엔 sigmoid or softmax)
])

# 모델 컴파일 (손실 함수는 평균제곱오차, 옵티마이저는 Adam)
model.compile(
    optimizer='adam',
    loss=tf.keras.losses.MeanSquaredError(),  # ← 문자열 대신 클래스 객체 사용
    metrics=['mae']
)

# 학습 시작
model.fit(X_train, y_train, epochs=50, validation_data=(X_val, y_val))

# 학습된 모델 저장 (.h5 확장자)
model.save("ai/scripts/alarm_model.h5")

print("✅ 모델 학습 완료 및 저장됨 (alarm_model.h5)")
