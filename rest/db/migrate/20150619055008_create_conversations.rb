class CreateConversations < ActiveRecord::Migration
  def change
    create_table :conversations do |t|
    	t.belongs_to :user, index: true
    	t.belongs_to :request, index: true
    	t.belongs_to :message, index: true

      	t.timestamps
    end
  end
end
