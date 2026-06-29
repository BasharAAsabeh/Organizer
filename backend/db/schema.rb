# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_06_28_225724) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "calendar_events", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "description"
    t.datetime "end_datetime"
    t.string "event_type", default: "event", null: false
    t.datetime "start_datetime", null: false
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["user_id", "start_datetime"], name: "index_calendar_events_on_user_id_and_start_datetime"
    t.index ["user_id"], name: "index_calendar_events_on_user_id"
    t.check_constraint "event_type::text = ANY (ARRAY['event'::character varying, 'note'::character varying, 'pinned'::character varying]::text[])", name: "calendar_events_event_type_check"
  end

  create_table "targets", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.date "deadline"
    t.text "description"
    t.boolean "is_finished", default: false, null: false
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["user_id", "deadline"], name: "index_targets_on_user_id_and_deadline"
    t.index ["user_id"], name: "index_targets_on_user_id"
  end

  create_table "task_details", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "notes"
    t.jsonb "resources", default: [], null: false
    t.bigint "task_id", null: false
    t.datetime "updated_at", null: false
    t.index ["task_id"], name: "index_task_details_on_task_id"
  end

  create_table "tasks", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "deadline"
    t.text "description"
    t.boolean "has_detail_page", default: false, null: false
    t.boolean "is_completed", default: false, null: false
    t.string "priority", default: "medium", null: false
    t.bigint "target_id"
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["target_id"], name: "index_tasks_on_target_id"
    t.index ["user_id", "deadline"], name: "index_tasks_on_user_id_and_deadline"
    t.index ["user_id", "is_completed"], name: "index_tasks_on_user_id_and_is_completed"
    t.index ["user_id"], name: "index_tasks_on_user_id"
    t.check_constraint "priority::text = ANY (ARRAY['high'::character varying, 'medium'::character varying, 'low'::character varying]::text[])", name: "tasks_priority_check"
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "email", null: false
    t.string "password_digest", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  add_foreign_key "calendar_events", "users"
  add_foreign_key "targets", "users"
  add_foreign_key "task_details", "tasks"
  add_foreign_key "tasks", "targets"
  add_foreign_key "tasks", "users"
end
