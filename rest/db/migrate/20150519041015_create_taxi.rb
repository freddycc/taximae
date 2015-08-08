class CreateTaxi < ActiveRecord::Migration
  def change
    create_table :taxis do |t|
    	t.belongs_to :user, index: true
    	t.belongs_to :service, index: true

    	t.timestamps
    end
  end
end
