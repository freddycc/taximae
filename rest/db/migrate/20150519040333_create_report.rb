class CreateReport < ActiveRecord::Migration
  def change
    create_table :reports do |t|
    	t.belongs_to :user, index: true
    	t.belongs_to :service, index: true
    	t.string :detail

    	t.timestamps
    end
  end
end
