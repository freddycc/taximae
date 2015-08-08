class AddRequestIdToReports < ActiveRecord::Migration
  def change
  	add_column :reports, :request_id, :integer
    add_index :reports, :request_id
  end
end
