"""
preprocess.py
역할: 데이터 전처리 관련 기능만 따로 분리해 구성한 모듈입니다.
현재는 정규화(MinMaxScaler)를 함수화한 기본 예시만 포함되어 있으며, 확장 가능.
"""

from sklearn.preprocessing import MinMaxScaler

def normalize_data(df, columns):
    """
    주어진 데이터프레임(df)의 특정 컬럼(columns)을 0~1 사이로 정규화합니다.
    추후 예측할 새 데이터에도 동일한 방식 적용을 위함.
    """
    scaler = MinMaxScaler()
    df[columns] = scaler.fit_transform(df[columns])
    return df
