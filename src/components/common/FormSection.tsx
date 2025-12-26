import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'date' | 'time' | 'radio-button';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  value?: string;
  onChange?: (value: string) => void;
}

interface FormSectionProps {
  title: string;
  fields: FormField[];
  className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  fields,
  className = ''
}) => {
  const renderField = (field: FormField) => {
    const commonProps = {
      name: field.name,
      placeholder: field.placeholder,
      required: field.required,
      value: field.value || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (field.onChange) {
          field.onChange(e.target.value);
        }
      }
    };

    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            {...commonProps}
            className="min-h-[100px]"
          />
        );
      
      case 'select':
        return (
          <Select value={field.value || ''} onValueChange={field.onChange || (() => {})}>
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'radio-button':
        if (field.options && field.options.length > 0) {
          return (
            <ToggleGroup
              type="single"
              value={field.value || ''}
              onValueChange={(value: string) => {
                if (value && field.onChange) field.onChange(value);
              }}
              className="justify-start"
            >
              {field.options.map((option) => (
                <ToggleGroupItem key={option.value} value={option.value} aria-label={option.label}>
                  {option.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          );
        }
        
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={field.value === 'true' || field.value === 'on'}
              onCheckedChange={(checked: boolean) => {
                if (field.onChange) field.onChange(checked ? 'true' : 'false');
              }}
            />
            <span className="text-sm text-muted-foreground">
              {field.value === 'true' || field.value === 'on' ? 'Aktif' : 'Tidak Aktif'}
            </span>
          </div>
        );
      
      default:
        return (
          <Input
            {...commonProps}
            type={field.type}
          />
        );
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {renderField(field)}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
