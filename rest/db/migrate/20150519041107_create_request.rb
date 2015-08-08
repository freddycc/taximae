class CreateRequest < ActiveRecord::Migration
  def change
    create_table :requests do |t|
    	t.belongs_to :user, index: true
    	t.belongs_to :service, index: true
    	t.string :service_type
    	t.string :payment_method
    	t.string :vehicle_type
    	t.float :latitud
    	t.float :longitud

    	t.timestamps
    end
  end
end
