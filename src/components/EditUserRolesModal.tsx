import React, { useState, useEffect } from 'react';
import { Role as IRole, User } from '../lib/types';
import { getRoles, updateUser, assignRoles } from '../lib/api';
import toast from 'react-hot-toast';

interface Props {
  user: User;
  onClose: () => void;
  onSave: (updatedUser: User) => void;
}

export const EditUserRolesModal: React.FC<Props> = ({ user, onClose, onSave }) => {
  const [roles, setRoles] = useState<IRole[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.Name || '',
    email: user.Email || '',
    telegramId: user.TelegramId || null,
    isTelegramVerified: user.IsTelegramVerified || false,
    notifyBeforeEvent: user.NotifyBeforeEvent || false
  });

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const rolesData = await getRoles();
        setRoles(rolesData);
        
        // Устанавливаем текущие роли пользователя
        if (user.Roles && user.Roles.length > 0) {
          setSelectedRoles(user.Roles);
        }
      } catch (error) {
        console.error('Error fetching roles:', error);
        toast.error('Failed to load roles');
      }
    };

    fetchRoles();
  }, [user]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleRole = (roleName: string) => {
    setSelectedRoles(prev =>
      prev.includes(roleName) 
        ? prev.filter(r => r !== roleName) 
        : [...prev, roleName]
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Обновляем данные пользователя
      await updateUser(user.Id, {
        Name: formData.name,
        Email: formData.email,
        TelegramId: formData.telegramId,
        IsTelegramVerified: formData.isTelegramVerified,
        NotifyBeforeEvent: formData.notifyBeforeEvent
      });

      // Обновляем роли пользователя
      await assignRoles(user.Id, selectedRoles);

      toast.success('User updated successfully');
      onSave(user); // Передаем исходного пользователя
      onClose();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit User: {user.Name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Основная информация */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Telegram ID
              </label>
              <input
                type="number"
                value={formData.telegramId || ''}
                onChange={(e) => handleInputChange('telegramId', e.target.value ? parseInt(e.target.value) : null)}
                placeholder="Enter Telegram ID"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>

          {/* Telegram и роли */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">Telegram & Roles</h3>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isTelegramVerified"
                  checked={formData.isTelegramVerified}
                  onChange={(e) => handleInputChange('isTelegramVerified', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                />
                <label htmlFor="isTelegramVerified" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                  Telegram Verified
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="notifyBeforeEvent"
                  checked={formData.notifyBeforeEvent}
                  onChange={(e) => handleInputChange('notifyBeforeEvent', e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                />
                <label htmlFor="notifyBeforeEvent" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                  Notify Before Events
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                User Roles
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-md p-3 bg-white dark:bg-gray-700">
                {roles.map(role => (
                  <div key={role.Id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`role-${role.Id}`}
                      checked={selectedRoles.includes(role.Name)}
                      onChange={() => toggleRole(role.Name)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                    />
                    <label htmlFor={`role-${role.Id}`} className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                      {role.Name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};