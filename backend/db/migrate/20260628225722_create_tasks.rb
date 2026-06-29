class CreateTasks < ActiveRecord::Migration[8.1]
  def change
    create_table :tasks do |t|
      t.references :user, null: false, foreign_key: true
      t.references :target, null: true, foreign_key: true
      t.string :title, null: false
      t.text :description
      t.string :priority, null: false, default: "medium"
      t.datetime :deadline
      t.boolean :is_completed, null: false, default: false
      t.boolean :has_detail_page, null: false, default: false

      t.timestamps
    end
    add_index :tasks, [:user_id, :deadline]
    add_index :tasks, [:user_id, :is_completed]
    add_check_constraint :tasks, "priority IN ('high', 'medium', 'low')", name: "tasks_priority_check"
  end
end
