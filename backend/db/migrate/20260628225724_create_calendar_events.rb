class CreateCalendarEvents < ActiveRecord::Migration[8.1]
  def change
    create_table :calendar_events do |t|
      t.references :user, null: false, foreign_key: true
      t.string :title, null: false
      t.text :description
      t.datetime :start_datetime, null: false
      t.datetime :end_datetime
      t.string :event_type, null: false, default: "event"

      t.timestamps
    end
    add_index :calendar_events, [:user_id, :start_datetime]
    add_check_constraint :calendar_events, "event_type IN ('event', 'note', 'pinned')", name: "calendar_events_event_type_check"
  end
end
