class AddAliasToTaxis < ActiveRecord::Migration
  def change
    add_column :taxis, :alias, :string
  end
end
