class CreateDirection < ActiveRecord::Migration
  def change
    create_table :directions do |t|
    	t.belongs_to :user, index: true
    	t.string :latitud
    	t.string :longitud

    	t.timestamps
    end
  end
end
