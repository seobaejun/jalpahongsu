# Firebase Storage 규칙 수정 방법

## 문제
Firebase Storage에 이미지가 저장되지 않는 문제가 발생했습니다. 현재 Storage 규칙이 인증된 사용자만 접근할 수 있도록 설정되어 있습니다.

## 해결 방법

### 1. Firebase Console 접속
1. https://console.firebase.google.com 접속
2. 프로젝트 "hongsu-9d9c2" 선택

### 2. Storage 규칙 수정
1. 왼쪽 메뉴에서 "Storage" 클릭
2. "Rules" 탭 클릭
3. 현재 규칙을 다음으로 변경:

```javascript
rules_version = "2";
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

### 3. 규칙 게시
1. "Publish" 버튼 클릭
2. 변경사항 확인 후 "Publish" 확인

## 임시 해결책 (개발용)
위 규칙은 모든 사용자가 Storage에 접근할 수 있도록 설정합니다. 
**보안상 프로덕션 환경에서는 인증된 사용자만 접근할 수 있도록 수정해야 합니다.**

## 영구 해결책 (프로덕션용)
```javascript
rules_version = "2";
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 확인 방법
규칙 수정 후 웹 애플리케이션에서 이미지 업로드를 테스트해보세요.
