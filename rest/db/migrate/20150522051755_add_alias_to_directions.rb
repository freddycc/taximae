class AddAliasToDirections < ActiveRecord::Migration
  def change
    add_column :directions, :alias, :string
  end
end
