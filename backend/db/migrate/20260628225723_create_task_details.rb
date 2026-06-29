class CreateTaskDetails < ActiveRecord::Migration[8.1]
  def change
    create_table :task_details do |t|
      t.references :task, null: false, foreign_key: true
      t.text :notes
      t.jsonb :resources, null: false, default: []

      t.timestamps
    end
  end
end
