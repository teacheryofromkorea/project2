-- =====================================================
-- app_settings 테이블 생성
-- 앱 전역 설정을 key-value 형태로 저장
-- =====================================================

CREATE TABLE IF NOT EXISTS public.app_settings (
    id SERIAL PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 기본값 삽입: 가챠 티켓 지급 기준 (역량 n점당 1장)
INSERT INTO public.app_settings (key, value, description)
VALUES ('stat_per_gacha', '5', '역량 점수 n점당 가챠 티켓 1장 지급')
ON CONFLICT (key) DO NOTHING;

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_app_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_app_settings_updated_at ON public.app_settings;
CREATE TRIGGER trigger_app_settings_updated_at
    BEFORE UPDATE ON public.app_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_app_settings_updated_at();

-- RLS 활성화 (필요시)
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- 모든 인증된 사용자가 읽을 수 있도록
CREATE POLICY "Anyone can read app_settings"
ON public.app_settings
FOR SELECT
USING (true);

-- 관리자만 수정 가능 (is_admin 체크는 profiles 테이블 기준)
CREATE POLICY "Admins can update app_settings"
ON public.app_settings
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
);

CREATE POLICY "Admins can insert app_settings"
ON public.app_settings
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
);
