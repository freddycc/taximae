class CreateRequestFavorites < ActiveRecord::Migration
  def change
    create_table :request_favorites do |t|
      t.string :alias
      t.belongs_to :user, index: true
      t.belongs_to :request, index: true

      t.timestamps
    end
  end
end
