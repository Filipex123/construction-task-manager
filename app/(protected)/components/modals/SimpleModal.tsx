import { Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SimpleInformation {
  value: string;
  description: string;
}

interface SimpleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  value: string;
  valuePlaceholder?: string;
  description?: string;
  descriptionPlaceholder?: string;
  handleSave: (value: SimpleInformation) => void;
  handleEdit: (value: SimpleInformation) => void;
  isEdit?: boolean;
}

export const SimpleModal: React.FC<SimpleModalProps> = ({ title = 'Valor', isEdit, value, description, handleSave, isOpen, onClose, valuePlaceholder, descriptionPlaceholder, handleEdit }) => {
  const [values, setValues] = useState<SimpleInformation>({ value: value || '', description: description || '' });
  const [errors, setErrors] = useState<SimpleInformation>({ value: '', description: '' });

  const handleCloseModal = () => {
    setErrors({ value: '', description: '' });
    onClose();
  };

  const handleSaveModal = () => {
    handleSave({ value: values.value, description: values.description ?? '' });
    setValues({ value: '', description: '' });
  };

  const handleEditModal = () => {
    handleEdit({ value: values.value, description: values.description ?? '' });
    setValues({ value: '', description: '' });
  };

  useEffect(() => {
    if (isOpen) {
      setValues({ value: value || '', description: description || '' });
    }
  }, [isOpen, value, description]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{isEdit ? `Editar ${title}` : `Novo ${title}`}</h2>
          <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-2">
              Nome *
            </label>
            <input
              id="value"
              type="text"
              value={values.value}
              onChange={(e) => setValues((prev) => ({ ...prev, value: e.target.value }))}
              className={`text-gray-600 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                errors.value ? 'border-red-300' : 'border-gray-300'
              }`}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  isEdit ? handleEditModal() : handleSaveModal();
                }
              }}
              placeholder={valuePlaceholder || 'Nome exemplo'}
            />
            {errors.value && <p className="mt-1 text-sm text-red-600">{errors.value}</p>}
          </div>

          {description !== undefined && (
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Complemento *
              </label>
              <input
                id="description"
                type="text"
                value={values.description}
                onChange={(e) => setValues((prev) => ({ ...prev, description: e.target.value }))}
                className={`text-gray-600 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder={descriptionPlaceholder || 'Complemento exemplo'}
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button
            onClick={isEdit ? handleEditModal : handleSaveModal}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            {isEdit ? 'Salvar' : 'Criar'}
          </button>
        </div>
      </div>
    </div>
  );
};
