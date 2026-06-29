class CreateTargets < ActiveRecord::Migration[8.1]
  def change
    create_table :targets do |t|
      t.references :user, null: false, foreign_key: true
      t.string :title, null: false
      t.text :description
      t.date :deadline
      t.boolean :is_finished, null: false, default: false

      t.timestamps
    end
    add_index :targets, [:user_id, :deadline]
  end
end
