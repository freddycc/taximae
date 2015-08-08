class AddDistanceRangeToServices < ActiveRecord::Migration
  def change
    add_column :services, :distance_range, :string
  end
end
