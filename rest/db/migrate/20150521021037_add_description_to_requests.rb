class AddDescriptionToRequests < ActiveRecord::Migration
  def change
    add_column :requests, :description, :string
  end
end
