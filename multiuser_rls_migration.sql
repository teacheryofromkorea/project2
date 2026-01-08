-- =====================================================
-- 멀티유저 RLS 마이그레이션 스크립트
-- 실행: Supabase SQL Editor에서 전체 복사 후 실행
-- =====================================================

-- =====================================================
-- STEP 1: user_id 컬럼 추가
-- =====================================================

-- 마스터 데이터 테이블들
ALTER TABLE missions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE timetable ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE time_blocks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Routine 관련 테이블들
ALTER TABLE attendance_routine_title ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE attendance_routine_items ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE break_routine_title ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE break_routine_items ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE lunch_routine_title ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE lunch_routine_items ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE end_routine_title ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE end_routine_items ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Stat 관련 테이블들
ALTER TABLE stat_templates ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Status 테이블들 (학생 상태 추적)
ALTER TABLE student_attendance_status ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE student_routine_status ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE student_mission_status ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE student_break_routine_status ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE student_lunch_routine_status ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE student_end_routine_status ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE student_end_check_status ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE student_point_history ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE student_stats ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE student_stat_logs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE student_pets ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 좌석 관련 테이블들
ALTER TABLE break_seat_status ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE lunch_seat_status ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 템플릿 테이블
ALTER TABLE class_resource_templates ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- =====================================================
-- STEP 2: RLS 활성화
-- =====================================================

ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_routine_title ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_routine_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE break_routine_title ENABLE ROW LEVEL SECURITY;
ALTER TABLE break_routine_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE lunch_routine_title ENABLE ROW LEVEL SECURITY;
ALTER TABLE lunch_routine_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE end_routine_title ENABLE ROW LEVEL SECURITY;
ALTER TABLE end_routine_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stat_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_attendance_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_routine_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_mission_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_break_routine_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_lunch_routine_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_end_routine_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_end_check_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_point_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_stat_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE break_seat_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE lunch_seat_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_resource_templates ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 3: 기존 public 정책 삭제 및 새 정책 생성
-- =====================================================

-- Helper function: Drop all policies for a table
CREATE OR REPLACE FUNCTION drop_all_policies(tbl text) RETURNS void AS $$
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname FROM pg_policies WHERE tablename = tbl AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, tbl);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Drop old policies
SELECT drop_all_policies('missions');
SELECT drop_all_policies('timetable');
SELECT drop_all_policies('time_blocks');
SELECT drop_all_policies('attendance_routine_title');
SELECT drop_all_policies('attendance_routine_items');
SELECT drop_all_policies('break_routine_title');
SELECT drop_all_policies('break_routine_items');
SELECT drop_all_policies('lunch_routine_title');
SELECT drop_all_policies('lunch_routine_items');
SELECT drop_all_policies('end_routine_title');
SELECT drop_all_policies('end_routine_items');
SELECT drop_all_policies('stat_templates');
SELECT drop_all_policies('student_attendance_status');
SELECT drop_all_policies('student_routine_status');
SELECT drop_all_policies('student_mission_status');
SELECT drop_all_policies('student_break_routine_status');
SELECT drop_all_policies('student_lunch_routine_status');
SELECT drop_all_policies('student_end_routine_status');
SELECT drop_all_policies('student_end_check_status');
SELECT drop_all_policies('student_point_history');
SELECT drop_all_policies('student_stats');
SELECT drop_all_policies('student_stat_logs');
SELECT drop_all_policies('student_pets');
SELECT drop_all_policies('break_seat_status');
SELECT drop_all_policies('lunch_seat_status');
SELECT drop_all_policies('class_resource_templates');

-- Drop the helper function
DROP FUNCTION drop_all_policies(text);

-- =====================================================
-- STEP 4: 새 RLS 정책 생성 (user_id = auth.uid())
-- =====================================================

-- missions
CREATE POLICY "Users can select own data" ON missions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own data" ON missions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own data" ON missions FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own data" ON missions FOR DELETE TO authenticated USING (user_id = auth.uid());

-- timetable
CREATE POLICY "Users can select own data" ON timetable FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own data" ON timetable FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own data" ON timetable FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own data" ON timetable FOR DELETE TO authenticated USING (user_id = auth.uid());

-- time_blocks
CREATE POLICY "Users can select own data" ON time_blocks FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own data" ON time_blocks FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own data" ON time_blocks FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own data" ON time_blocks FOR DELETE TO authenticated USING (user_id = auth.uid());

-- attendance_routine_title
CREATE POLICY "Users can select own data" ON attendance_routine_title FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own data" ON attendance_routine_title FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own data" ON attendance_routine_title FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own data" ON attendance_routine_title FOR DELETE TO authenticated USING (user_id = auth.uid());

-- attendance_routine_items
CREATE POLICY "Users can select own data" ON attendance_routine_items FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own data" ON attendance_routine_items FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own data" ON attendance_routine_items FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own data" ON attendance_routine_items FOR DELETE TO authenticated USING (user_id = auth.uid());

-- break_routine_title
CREATE POLICY "Users can select own data" ON break_routine_title FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own data" ON break_routine_title FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own data" ON break_routine_title FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own data" ON break_routine_title FOR DELETE TO authenticated USING (user_id = auth.uid());

-- break_routine_items
CREATE POLICY "Users can select own data" ON break_routine_items FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own data" ON break_routine_items FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own data" ON break_routine_items FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own data" ON break_routine_items FOR DELETE TO authenticated USING (user_id = auth.uid());

-- lunch_routine_title
CREATE POLICY "Users can select own data" ON lunch_routine_title FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own data" ON lunch_routine_title FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own data" ON lunch_routine_title FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own data" ON lunch_routine_title FOR DELETE TO authenticated USING (user_id = auth.uid());

-- lunch_routine_items
CREATE POLICY "Users can select own data" ON lunch_routine_items FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own data" ON lunch_routine_items FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own data" ON lunch_routine_items FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own data" ON lunch_routine_items FOR DELETE TO authenticated USING (user_id = auth.uid());

-- end_routine_title
CREATE POLICY "Users can select own data" ON end_routine_title FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own data" ON end_routine_title FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own data" ON end_routine_title FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own data" ON end_routine_title FOR DELETE TO authenticated USING (user_id = auth.uid());

-- end_routine_items
CREATE POLICY "Users can select own data" ON end_routine_items FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own data" ON end_routine_items FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own data" ON end_routine_items FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own data" ON end_routine_items FOR DELETE TO authenticated USING (user_id = auth.uid());

-- stat_templates
CREATE POLICY "Users can select own data" ON stat_templates FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own data" ON stat_templates FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own data" ON stat_templates FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own data" ON stat_templates FOR DELETE TO authenticated USING (user_id = auth.uid());

-- student_attendance_status
CREATE POLICY "Users can select own data" ON student_attendance_status FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own data" ON student_attendance_status FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own data" ON student_attendance_status FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own data" ON student_attendance_status FOR DELETE TO authenticated USING (user_id = auth.uid());

-- student_routine_status
CREATE POLICY "Users can select own data" ON student_routine_status FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own data" ON student_routine_status FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own data" ON student_routine_status FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own data" ON student_routine_status FOR DELETE TO authenticated USING (user_id = auth.uid());

-- student_mission_status
CREATE POLICY "Users can select own data" ON student_mission_status FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own data" ON student_mission_status FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own data" ON student_mission_status FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own data" ON student_mission_status FOR DELETE TO authenticated USING (user_id = auth.uid());

-- student_break_routine_status
CREATE POLICY "Users can select own data" ON student_break_routine_status FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own data" ON student_break_routine_status FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own data" ON student_break_routine_status FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own data" ON student_break_routine_status FOR DELETE TO authenticated USING (user_id = auth.uid());

-- student_lunch_routine_status
CREATE POLICY "Users can select own data" ON student_lunch_routine_status FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own data" ON student_lunch_routine_status FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own data" ON student_lunch_routine_status FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own data" ON student_lunch_routine_status FOR DELETE TO authenticated USING (user_id = auth.uid());

-- student_end_routine_status
CREATE POLICY "Users can select own data" ON student_end_routine_status FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own data" ON student_end_routine_status FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own data" ON student_end_routine_status FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own data" ON student_end_routine_status FOR DELETE TO authenticated USING (user_id = auth.uid());

-- student_end_check_status
CREATE POLICY "Users can select own data" ON student_end_check_status FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own data" ON student_end_check_status FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own data" ON student_end_check_status FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own data" ON student_end_check_status FOR DELETE TO authenticated USING (user_id = auth.uid());

-- student_point_history
CREATE POLICY "Users can select own data" ON student_point_history FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own data" ON student_point_history FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own data" ON student_point_history FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own data" ON student_point_history FOR DELETE TO authenticated USING (user_id = auth.uid());

-- student_stats
CREATE POLICY "Users can select own data" ON student_stats FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own data" ON student_stats FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own data" ON student_stats FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own data" ON student_stats FOR DELETE TO authenticated USING (user_id = auth.uid());

-- student_stat_logs
CREATE POLICY "Users can select own data" ON student_stat_logs FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own data" ON student_stat_logs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own data" ON student_stat_logs FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own data" ON student_stat_logs FOR DELETE TO authenticated USING (user_id = auth.uid());

-- student_pets
CREATE POLICY "Users can select own data" ON student_pets FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own data" ON student_pets FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own data" ON student_pets FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own data" ON student_pets FOR DELETE TO authenticated USING (user_id = auth.uid());

-- break_seat_status
CREATE POLICY "Users can select own data" ON break_seat_status FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own data" ON break_seat_status FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own data" ON break_seat_status FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own data" ON break_seat_status FOR DELETE TO authenticated USING (user_id = auth.uid());

-- lunch_seat_status
CREATE POLICY "Users can select own data" ON lunch_seat_status FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own data" ON lunch_seat_status FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own data" ON lunch_seat_status FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own data" ON lunch_seat_status FOR DELETE TO authenticated USING (user_id = auth.uid());

-- class_resource_templates  
CREATE POLICY "Users can select own data" ON class_resource_templates FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own data" ON class_resource_templates FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own data" ON class_resource_templates FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own data" ON class_resource_templates FOR DELETE TO authenticated USING (user_id = auth.uid());

-- =====================================================
-- STEP 5: Trigger 생성 (자동으로 user_id 설정)
-- =====================================================

-- set_user_id 함수가 이미 있다면 건너뛰기
CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 각 테이블에 Trigger 추가
CREATE TRIGGER set_missions_user_id BEFORE INSERT ON missions FOR EACH ROW EXECUTE FUNCTION set_user_id();
CREATE TRIGGER set_timetable_user_id BEFORE INSERT ON timetable FOR EACH ROW EXECUTE FUNCTION set_user_id();
CREATE TRIGGER set_time_blocks_user_id BEFORE INSERT ON time_blocks FOR EACH ROW EXECUTE FUNCTION set_user_id();
CREATE TRIGGER set_attendance_routine_title_user_id BEFORE INSERT ON attendance_routine_title FOR EACH ROW EXECUTE FUNCTION set_user_id();
CREATE TRIGGER set_attendance_routine_items_user_id BEFORE INSERT ON attendance_routine_items FOR EACH ROW EXECUTE FUNCTION set_user_id();
CREATE TRIGGER set_break_routine_title_user_id BEFORE INSERT ON break_routine_title FOR EACH ROW EXECUTE FUNCTION set_user_id();
CREATE TRIGGER set_break_routine_items_user_id BEFORE INSERT ON break_routine_items FOR EACH ROW EXECUTE FUNCTION set_user_id();
CREATE TRIGGER set_lunch_routine_title_user_id BEFORE INSERT ON lunch_routine_title FOR EACH ROW EXECUTE FUNCTION set_user_id();
CREATE TRIGGER set_lunch_routine_items_user_id BEFORE INSERT ON lunch_routine_items FOR EACH ROW EXECUTE FUNCTION set_user_id();
CREATE TRIGGER set_end_routine_title_user_id BEFORE INSERT ON end_routine_title FOR EACH ROW EXECUTE FUNCTION set_user_id();
CREATE TRIGGER set_end_routine_items_user_id BEFORE INSERT ON end_routine_items FOR EACH ROW EXECUTE FUNCTION set_user_id();
CREATE TRIGGER set_stat_templates_user_id BEFORE INSERT ON stat_templates FOR EACH ROW EXECUTE FUNCTION set_user_id();
CREATE TRIGGER set_student_attendance_status_user_id BEFORE INSERT ON student_attendance_status FOR EACH ROW EXECUTE FUNCTION set_user_id();
CREATE TRIGGER set_student_routine_status_user_id BEFORE INSERT ON student_routine_status FOR EACH ROW EXECUTE FUNCTION set_user_id();
CREATE TRIGGER set_student_mission_status_user_id BEFORE INSERT ON student_mission_status FOR EACH ROW EXECUTE FUNCTION set_user_id();
CREATE TRIGGER set_student_break_routine_status_user_id BEFORE INSERT ON student_break_routine_status FOR EACH ROW EXECUTE FUNCTION set_user_id();
CREATE TRIGGER set_student_lunch_routine_status_user_id BEFORE INSERT ON student_lunch_routine_status FOR EACH ROW EXECUTE FUNCTION set_user_id();
CREATE TRIGGER set_student_end_routine_status_user_id BEFORE INSERT ON student_end_routine_status FOR EACH ROW EXECUTE FUNCTION set_user_id();
CREATE TRIGGER set_student_end_check_status_user_id BEFORE INSERT ON student_end_check_status FOR EACH ROW EXECUTE FUNCTION set_user_id();
CREATE TRIGGER set_student_point_history_user_id BEFORE INSERT ON student_point_history FOR EACH ROW EXECUTE FUNCTION set_user_id();
CREATE TRIGGER set_student_stats_user_id BEFORE INSERT ON student_stats FOR EACH ROW EXECUTE FUNCTION set_user_id();
CREATE TRIGGER set_student_stat_logs_user_id BEFORE INSERT ON student_stat_logs FOR EACH ROW EXECUTE FUNCTION set_user_id();
CREATE TRIGGER set_student_pets_user_id BEFORE INSERT ON student_pets FOR EACH ROW EXECUTE FUNCTION set_user_id();
CREATE TRIGGER set_break_seat_status_user_id BEFORE INSERT ON break_seat_status FOR EACH ROW EXECUTE FUNCTION set_user_id();
CREATE TRIGGER set_lunch_seat_status_user_id BEFORE INSERT ON lunch_seat_status FOR EACH ROW EXECUTE FUNCTION set_user_id();
CREATE TRIGGER set_class_resource_templates_user_id BEFORE INSERT ON class_resource_templates FOR EACH ROW EXECUTE FUNCTION set_user_id();

-- =====================================================
-- STEP 6: 기존 NULL 데이터 삭제 (선택사항)
-- =====================================================

-- 주의: 이 부분은 기존 데이터를 삭제합니다!
-- 필요하지 않으면 주석 처리된 상태로 두세요.

DELETE FROM missions WHERE user_id IS NULL;
DELETE FROM timetable WHERE user_id IS NULL;
DELETE FROM time_blocks WHERE user_id IS NULL;
DELETE FROM attendance_routine_title WHERE user_id IS NULL;
DELETE FROM attendance_routine_items WHERE user_id IS NULL;
DELETE FROM break_routine_title WHERE user_id IS NULL;
DELETE FROM break_routine_items WHERE user_id IS NULL;
DELETE FROM lunch_routine_title WHERE user_id IS NULL;
DELETE FROM lunch_routine_items WHERE user_id IS NULL;
DELETE FROM end_routine_title WHERE user_id IS NULL;
DELETE FROM end_routine_items WHERE user_id IS NULL;
DELETE FROM stat_templates WHERE user_id IS NULL;
DELETE FROM student_attendance_status WHERE user_id IS NULL;
DELETE FROM student_routine_status WHERE user_id IS NULL;
DELETE FROM student_mission_status WHERE user_id IS NULL;
DELETE FROM student_break_routine_status WHERE user_id IS NULL;
DELETE FROM student_lunch_routine_status WHERE user_id IS NULL;
DELETE FROM student_end_routine_status WHERE user_id IS NULL;
DELETE FROM student_end_check_status WHERE user_id IS NULL;
DELETE FROM student_point_history WHERE user_id IS NULL;
DELETE FROM student_stats WHERE user_id IS NULL;
DELETE FROM student_stat_logs WHERE user_id IS NULL;
DELETE FROM student_pets WHERE user_id IS NULL;
DELETE FROM break_seat_status WHERE user_id IS NULL;
DELETE FROM lunch_seat_status WHERE user_id IS NULL;
DELETE FROM class_resource_templates WHERE user_id IS NULL;

-- =====================================================
-- 완료! 🎉
-- =====================================================
