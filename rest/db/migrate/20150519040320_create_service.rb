class CreateService < ActiveRecord::Migration
  def change
    create_table :services do |t|
    	t.belongs_to :user, index: true
    	t.string :service_type
    	t.string :payment_method
    	t.string :vehicle_type
    	t.int :score

    	t.timestamps
    end
  end
end
