import React, { useState, useEffect } from "react";
import { PlusCircle, Trash2, Plus, FileText, Eye, EyeOff, Save, AlertCircle, XCircle, Edit } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { formNewQuestionaire } from "@/app/components/schema/Forms";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";

export const FormBuilder = ({ customFields, setCustomFields, edit }: any) => {
  const [isNewQuestion, setIsNewQuestion] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [isHide, setIsHide] = useState(true);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [showUserTemplates, setShowUserTemplates] = useState(false);
  const [userTemplates, setUserTemplates] = useState<any[]>([]);
  const [newTemplate, setNewTemplate] = useState<{
    name: string;
    description: string;
  }>({
    name: "",
    description: "",
  });
  const [saveError, setSaveError] = useState("");
  const [field, setField] = useState<any>(null);

  useEffect(() => {
    if (customFields?.length > 0) setIsHide(false);
    else setIsHide(true);
  }, [customFields]);

  useEffect(() => {
    const savedTemplates = localStorage.getItem("useranys");
    if (savedTemplates) {
      try {
        setUserTemplates(JSON.parse(savedTemplates));
      } catch (e) {
        console.error("Error loading saved templates:", e);
      }
    }
  }, []);

  const removeField = (id: string) => {
    setCustomFields(customFields.filter((field: any) => field.id !== id));
  };

  const saveTemplate = () => {
    if (!newTemplate.name) {
      setSaveError("Please provide a template name");
      return;
    }

    if (customFields.length === 0) {
      setSaveError("Cannot save an empty template. Please add at least one question.");
      return;
    }

    const template: any = {
      id: Date.now().toString(),
      name: newTemplate.name,
      description: newTemplate.description || `Created on ${new Date().toLocaleDateString()}`,
      fields: customFields,
      createdAt: new Date().toISOString(),
    };

    const updatedTemplates = [...userTemplates, template];
    setUserTemplates(updatedTemplates);

    // Save to localStorage
    localStorage.setItem("useranys", JSON.stringify(updatedTemplates));

    setNewTemplate({ name: "", description: "" });
    setShowSaveTemplate(false);
    setSaveError("");
  };

  return (
    <div className='space-y-4'>
      {customFields.length > 0 && (
        <div className='space-y-4'>
          {customFields.map((field: any) => (
            <div key={field.id} className='flex items-start justify-between p-4 border gap-5 rounded-md bg-gray-50'>
              <div className='flex gap-1 flex-col'>
                <div className='flex flex-wrap gap-2 items-center'>
                  <span className='font-medium'>{field.label}</span>
                  {field.required && <span className='text-red-500 text-sm'>*required</span>}
                </div>
                <div className='text-sm text-gray-500 mt-1'>
                  FieldType: {field.fieldType.charAt(0).toUpperCase() + field.fieldType.slice(1)}
                  {(field.fieldType === "dropdown" || field.fieldType === "checkbox") && field.options && (
                    <div className='mt-1'>Options: {field.options.join(", ")}</div>
                  )}
                </div>
              </div>
              {edit && (
                <div className='flex gap-2'>
                  <Edit
                    onClick={() => {
                      setField(field);
                      setIsNewQuestion(true);
                    }}
                    className='h-5 w-5 cursor-pointer text-green-500 hover:text-green-700'
                  />
                  <Trash2
                    onClick={() => removeField(field.id)}
                    className='h-5 w-5 cursor-pointer text-red-500 hover:text-red-700'
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {customFields?.length > 0 && (
        <div className='w-full flex justify-end'>
          <button
            type='button'
            onClick={() => setIsPreview(true)}
            className='text-sm hover:text-red-700 flex gap-2 items-center'
          >
            <Eye className='h-5 w-5' />
            Show preview
          </button>
        </div>
      )}

      {edit && (
        <div className='flex gap-2 flex-wrap'>
          <button
            onClick={() => setIsNewQuestion(true)}
            type='button'
            className='border flex gap-1 items-center px-4 py-2 rounded-md hover:border-black border-gray-300'
          >
            <PlusCircle className='h-5 w-5 mr-2' />
            Add Custom Question
          </button>

          {/* {customFields?.length > 0 ? (
          <button
            type='button'
            onClick={() => setShowSaveTemplate(true)}
            className='inline-flex items-center outline-none px-4 py-2 border border-purple-300 rounded-md shadow-sm text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
          >
            <Save className='h-5 w-5 mr-2 text-purple-500' />
            Save as Template
          </button>
        ) : ( */}
          {isHide && (
            <div className='flex flex-gap gap-2'>
              <button
                type='button'
                onClick={() => setShowTemplates(true)}
                className='flex items-center px-4 py-2 rounded-md border border-indigo-300 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100'
              >
                <FileText className='h-5 w-5 mr-2 text-indigo-500' />
                Use Question Template
              </button>
              {/* {userTemplates.length > 0 && (
            <button
              type='button'
              onClick={() => setShowUserTemplates(true)}
              className='inline-flex items-center px-4 py-2 border border-green-300 rounded-md shadow-sm text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
            >
              <BookOpen className='h-5 w-5 mr-2 text-green-500' />
              My Templates ({userTemplates.length})
            </button>
          )} */}
            </div>
          )}
          {/* )} */}
        </div>
      )}
      {showSaveTemplate && (
        <div className='border rounded-md p-4 bg-white'>
          <h3 className='text-md font-medium mb-4'>Save as Template</h3>

          <div className='space-y-4'>
            {saveError && (
              <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start'>
                <AlertCircle className='h-5 w-5 mr-2 flex-shrink-0 mt-0.5' />
                <span>{saveError}</span>
              </div>
            )}

            <div>
              <label htmlFor='templateName' className='block text-sm font-medium text-gray-700'>
                Template Name *
              </label>
              <input
                type='text'
                id='templateName'
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                placeholder='e.g., Conference Registration'
              />
            </div>

            <div>
              <label htmlFor='templateDescription' className='block text-sm font-medium text-gray-700'>
                Description (Optional)
              </label>
              <textarea
                id='templateDescription'
                value={newTemplate.description}
                onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                rows={2}
                className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                placeholder='Briefly describe what this template is for'
              />
            </div>

            <div className='bg-gray-50 p-3 rounded-md'>
              <h4 className='text-sm font-medium text-gray-700 mb-2'>Template Preview</h4>
              <div className='text-sm text-gray-600'>
                <p>
                  This template will include {customFields.length} question{customFields.length !== 1 ? "s" : ""}:
                </p>
                <ul className='mt-1 list-disc list-inside text-xs text-gray-500'>
                  {customFields.map((field: any, index: number) => (
                    <li key={index}>
                      {field.label}
                      {field.required ? " *" : ""}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className='flex justify-end space-x-3'>
              <button
                type='button'
                onClick={() => {
                  setShowSaveTemplate(false);
                  setNewTemplate({ name: "", description: "" });
                  setSaveError("");
                }}
                className='inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50'
              >
                Cancel
              </button>
              <button
                type='button'
                onClick={saveTemplate}
                className='inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
              >
                <Save className='h-4 w-4 mr-2' />
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}

      {isNewQuestion && (
        <NewQuestion
          field={field}
          setField={setField}
          customFields={customFields}
          setCustomFields={setCustomFields}
          isNewQuestion={isNewQuestion}
          setIsNewQuestion={setIsNewQuestion}
        />
      )}
      {showTemplates && (
        <UseTemplates
          customFields={customFields}
          setCustomFields={setCustomFields}
          showTemplates={showTemplates}
          setShowTemplates={setShowTemplates}
        />
      )}
      {showUserTemplates && (
        <MyTemplates
          customFields={customFields}
          setCustomFields={setCustomFields}
          userTemplates={userTemplates}
          setUserTemplates={setUserTemplates}
          showUserTemplates={showUserTemplates}
          setShowUserTemplates={setShowUserTemplates}
        />
      )}
      {isPreview && (
        <PreviewQuestionaire customFields={customFields} isPreview={isPreview} setIsPreview={setIsPreview} />
      )}
    </div>
  );
};

export const TermsAndConditions = ({ termsAndConditions, setTermsAndConditions, edit }: any) => {
  const [showPreview, setShowPreview] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTermsAndConditions(e.target.value);
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  // Sample template for terms and conditions
  const sampleTemplate = `# Terms and Conditions for [Event Name]

## 1. Registration and Attendance
- All attendees must register through the official registration process.
- Attendees must be at least [age] years old to participate.
- Registration is only confirmed upon receipt of payment (if applicable).

## 2. Cancellation Policy
- Cancellations made more than [X] days before the event will receive a full refund.
- Cancellations made [X-Y] days before the event will receive a 50% refund.
- No refunds for cancellations made less than [Y] days before the event.

## 3. Code of Conduct
- All attendees must behave in a respectful and professional manner.
- Harassment or discrimination of any kind will not be tolerated.
- Organizers reserve the right to remove any attendee violating the code of conduct without refund.

## 4. Media Release
- By attending, participants grant permission for their image to be used in event photography and recordings.
- These materials may be used for promotional purposes in the future.

## 5. Liability
- Attendees participate at their own risk.
- The organizers are not responsible for any personal injury, loss, or damage to personal property.

## 6. Changes to the Event
- Organizers reserve the right to modify the event program, speakers, or venue if necessary.
- In case of event cancellation, attendees will be notified and refunded according to the cancellation policy.

## 7. Privacy Policy
- Personal information collected during registration will be used solely for event-related purposes.
- Data will be handled in accordance with our privacy policy and applicable data protection laws.

Last updated: [Date]`;

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between'>
        {edit ? (
          <button
            type='button'
            onClick={() => setTermsAndConditions(sampleTemplate)}
            className='text-sm text-indigo-600 hover:text-indigo-800'
          >
            Use Template
          </button>
        ) : (
          <button
            type='button'
            onClick={togglePreview}
            className='inline-flex items-center text-sm text-gray-600 hover:text-gray-900'
          >
            {showPreview ? (
              <>
                <EyeOff className='h-4 w-4 mr-1' />
                Hide Preview
              </>
            ) : (
              <>
                <Eye className='h-4 w-4 mr-1' />
                Show Preview
              </>
            )}
          </button>
        )}
      </div>

      {edit && (
        <div className='border rounded-md overflow-hidden'>
          <div className='bg-gray-50 px-4 py-2 border-b flex justify-between items-center'>
            <span className='text-sm font-medium text-gray-700'>Terms and Conditions</span>
            <button
              type='button'
              onClick={togglePreview}
              className='inline-flex items-center text-sm text-gray-600 hover:text-gray-900'
            >
              {showPreview ? (
                <>
                  <EyeOff className='h-4 w-4 mr-1' />
                  Hide Preview
                </>
              ) : (
                <>
                  <Eye className='h-4 w-4 mr-1' />
                  Show Preview
                </>
              )}
            </button>
          </div>

          {!showPreview ? (
            <textarea
              value={termsAndConditions}
              onChange={handleChange}
              rows={10}
              className='w-full p-3 border-0 focus:ring-0 text-sm'
              placeholder="Enter your event's terms and conditions here. You can use Markdown formatting."
            />
          ) : (
            <div className='p-4 prose prose-sm max-w-none'>
              {termsAndConditions ? (
                <div className='whitespace-pre-wrap'>{termsAndConditions}</div>
              ) : (
                <p className='text-gray-500 italic'>No terms and conditions added yet.</p>
              )}
            </div>
          )}
        </div>
      )}
      {edit && (
        <div className='text-sm text-gray-500'>
          <p>Tips:</p>
          <ul className='list-disc pl-5 space-y-1 mt-1'>
            <li>Be clear and concise about your policies</li>
            <li>Include cancellation and refund policies</li>
            <li>Address liability and code of conduct</li>
            <li>Consider adding privacy information</li>
          </ul>
        </div>
      )}
      {showPreview && (
        <PreviewTerms
          termsAndConditions={termsAndConditions}
          showPreview={showPreview}
          setShowPreview={setShowPreview}
        />
      )}
    </div>
  );
};

export const PreviewTerms = ({
  termsAndConditions,
  showPreview,
  setShowPreview,
  isTerms,
  setIsTerms,
  submitTicket,
  ticketData,
}: any) => {
  return (
    <AlertDialog open={showPreview} onOpenChange={() => setShowPreview(false)}>
      <AlertDialogContent className='bg-transparent left-[50%] top-[50%] px-4 max-w-[800px] w-full'>
        <div className='px-4 sm:px-6 pb-10 bg-white rounded-md'>
          <AlertDialogHeader className='flex-row gap-4 sticky py-5 bg-white top-0'>
            <div className='flex justify-between items-center gap-4 w-full'>
              <AlertDialogTitle className='text-black pb-2'>Registration Form Preview</AlertDialogTitle>
              <XCircle onClick={() => setShowPreview(false)} className='hover:text-red-700' />
            </div>
          </AlertDialogHeader>
          <div className='bg-red-50 border border-red-700 rounded-md p-4'>
            {termsAndConditions ? (
              <div className='space-y-3'>
                <div className='max-h-sh] overflow-y-auto border rounded bg-white p-3 text-sm flex flex-col gap-2'>
                  <ReactMarkdown className='terms'>{termsAndConditions}</ReactMarkdown>
                </div>
                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    id='agree-terms'
                    onChange={() => {
                      setShowPreview(false);
                      if (isTerms) {
                        setIsTerms(false);
                        submitTicket(ticketData);
                      }
                    }}
                    className='h-4 w-4 cursor-pointer hover:border-red-700 border-gray-300 rounded'
                  />
                  <label htmlFor='agree-terms' className='ml-2 block text-sm text-gray-700'>
                    I agree to the terms and conditions
                  </label>
                </div>
              </div>
            ) : (
              <p className='text-sm text-gray-500 italic'>
                Add terms and conditions to see how they will appear on the registration form.
              </p>
            )}
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const anys = {
  dietary: [
    {
      id: "dietary-restrictions",
      fieldType: "dropdown" as const,
      label: "Do you have any dietary restrictions?",
      required: true,
      options: ["None", "Vegetarian", "Vegan", "Gluten-free", "Dairy-free", "Nut allergy", "Other (please specify)"],
    },
    {
      id: "dietary-notes",
      fieldType: "text" as const,
      label: 'If you selected "Other" above, please specify your dietary requirements',
      required: false,
    },
  ],
  accessibility: [
    {
      id: "accessibility-needs",
      fieldType: "checkbox" as const,
      label: "Do you require any accessibility accommodations?",
      required: false,
      options: [
        "Wheelchair access",
        "Sign language interpreter",
        "Reserved seating",
        "Large print materials",
        "Other (please specify)",
      ],
    },
    {
      id: "accessibility-notes",
      fieldType: "text" as const,
      label: "Please provide any additional details about your accessibility requirements",
      required: false,
    },
  ],
  transportation: [
    {
      id: "transportation-mode",
      fieldType: "dropdown" as const,
      label: "How will you be traveling to the event?",
      required: false,
      options: ["Car", "Public transportation", "Walking/Biking", "Rideshare", "Other"],
    },
    {
      id: "parking-needed",
      fieldType: "checkbox" as const,
      label: "Do you need parking information?",
      required: false,
      options: ["Yes, I need parking information"],
    },
  ],
  contact: [
    {
      id: "emergency-contact-name",
      fieldType: "text" as const,
      label: "Emergency Contact Name",
      required: true,
    },
    {
      id: "emergency-contact-phone",
      fieldType: "text" as const,
      label: "Emergency Contact Phone Number",
      required: true,
    },
    {
      id: "emergency-contact-relation",
      fieldType: "text" as const,
      label: "Relationship to Emergency Contact",
      required: false,
    },
  ],
};

const MyTemplates = ({
  userTemplates,
  customFields,
  setCustomFields,
  setUserTemplates,
  showUserTemplates,
  setShowUserTemplates,
}: any) => {
  const deleteUserTemplate = (id: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      const updatedTemplates = userTemplates.filter((template: any) => template.id !== id);
      setUserTemplates(updatedTemplates);
      localStorage.setItem("useranys", JSON.stringify(updatedTemplates));
    }
  };

  const applyUserTemplate = (template: any) => {
    const fieldsWithUniqueIds = template.fields.map((field: any) => ({
      ...field,
      id: `${field.id}-${Date.now()}`,
    }));

    setCustomFields([...customFields, ...fieldsWithUniqueIds]);
    setShowUserTemplates(false);
  };
  return (
    <AlertDialog open={showUserTemplates} onOpenChange={() => setShowUserTemplates(false)}>
      <AlertDialogContent className='bg-transparent left-[50%] top-[50%] px-4 max-w-[800px] w-full'>
        <div className='rounded-lg px-4 sm:px-6 pb-5 sm:pb-6 bg-white'>
          <AlertDialogHeader className='flex-row gap-4 sticky py-5 bg-white top-0'>
            <div className='flex justify-between items-center mb-4 gap-4 w-full'>
              <AlertDialogTitle className='text-black pb-2'>My Saved Templates</AlertDialogTitle>
              <XCircle onClick={() => setShowUserTemplates(false)} className='hover:text-red-700' />
            </div>
          </AlertDialogHeader>

          {userTemplates.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {userTemplates.map((template: any) => (
                <div key={template.id} className='border rounded-md p-4 hover:border-black'>
                  <div className='flex justify-between gap-6 items-center'>
                    <h6>{template.name}</h6>
                    <div className='flex space-x-2'>
                      <button
                        onClick={() => applyUserTemplate(template)}
                        className='text-green-600 hover:text-green-800'
                        title='Use this template'
                      >
                        <Plus className='h-5 w-5' />
                      </button>
                      <button
                        onClick={() => deleteUserTemplate(template.id)}
                        className='text-red-500 hover:text-red-700'
                        title='Delete this template'
                      >
                        <Trash2 className='h-5 w-5' />
                      </button>
                    </div>
                  </div>
                  <p className='mt-1'>{template.description}</p>
                  <p className='text-xs text-gray-400'>Created: {new Date(template.createdAt).toLocaleDateString()}</p>
                  <div className='mt-2 text-sm text-gray-600'>
                    <span className='text-red-700'>{template.fields.length} questions</span>
                    <ul className='mt-1 list-disc list-inside text-xs text-gray-500'>
                      {template.fields.slice(0, 3).map((field: any, index: number) => (
                        <li key={index}>{field.label}</li>
                      ))}
                      {template.fields.length > 3 && (
                        <li className='text-gray-400'>...and {template.fields.length - 3} more</li>
                      )}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='text-center py-6 text-gray-500'>
              <p>You haven't saved any templates yet.</p>
              <p className='text-sm'>Create and save a template to reuse it for future events.</p>
            </div>
          )}

          <AlertDialogFooter className='flex my-[10px]'></AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const UseTemplates = ({ customFields, setCustomFields, showTemplates, setShowTemplates }: any) => {
  const applyTemplate = (templateName: keyof typeof anys) => {
    const templateWithUniqueIds = anys[templateName].map((field: any) => ({
      ...field,
      id: `${field.id}-${Date.now()}`,
    }));

    setCustomFields([...customFields, ...templateWithUniqueIds]);
    setShowTemplates(false);
  };

  return (
    <AlertDialog open={showTemplates} onOpenChange={() => setShowTemplates(false)}>
      <AlertDialogContent className='bg-transparent left-[50%] top-[50%] px-4 max-w-[800px] w-full'>
        <div className='rounded-lg px-4 sm:px-6 pb-5 sm:pb-6 bg-white'>
          <AlertDialogHeader className='flex-row gap-4 sticky py-5 bg-white top-0'>
            <div className='flex justify-between items-center mb-4 gap-4 w-full'>
              <AlertDialogTitle className='text-black pb-2'>Choose a Question Template</AlertDialogTitle>
              <XCircle onClick={() => setShowTemplates(false)} className='hover:text-red-700' />
            </div>
          </AlertDialogHeader>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {questionTemplates.map((template: any, index: number) => (
              <div
                key={index}
                onClick={() => applyTemplate(template.value)}
                className='border flex flex-col gap-2 rounded-md p-4 hover:bg-red-50 cursor-pointer hover:border-red-700 transition-colors'
              >
                <h6>{template.title}</h6>
                <p>{template.description}</p>
              </div>
            ))}
          </div>

          <AlertDialogFooter className='flex my-[10px]'></AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const PreviewQuestionaire = ({ customFields, isPreview, setIsPreview }: any) => {
  return (
    <AlertDialog open={isPreview} onOpenChange={() => setIsPreview(false)}>
      <AlertDialogContent className='bg-transparent left-[50%] top-[50%] px-4 max-w-[800px] w-full'>
        <div className='px-4 sm:px-6 pb-10 bg-white rounded-md'>
          <AlertDialogHeader className='flex-row gap-4 sticky py-5 bg-white top-0'>
            <div className='flex justify-between items-center gap-4 w-full'>
              <AlertDialogTitle className='text-black pb-2'>Preview</AlertDialogTitle>
              <XCircle onClick={() => setIsPreview(false)} className='hover:text-red-700' />
            </div>
          </AlertDialogHeader>
          <div className='flex flex-col gap-5'>
            {customFields.map((field: any, index: number) => (
              <div key={field.id} className='flex flex-col gap-2'>
                <div className='flex gap-2 items-start'>
                  <h6>{index + 1}.</h6>
                  <h6>
                    {field.label} {field.required && <span className='text-red-500'>*</span>}
                  </h6>
                </div>

                {field.fieldType === "text" && <Textarea className='h-24' placeholder='Enter text' />}
                {field.fieldType === "radio" && field.options && field.options.length > 0 && (
                  <div className='space-y-2'>
                    {field.options
                      .filter((option: any) => option && option.trim() !== "")
                      .map((option: any, index: number) => (
                        <div key={index} className='flex items-center gap-2'>
                          <input
                            type='radio'
                            name={field.id}
                            id={`${field.id}-option-${index}`}
                            className='h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded'
                          />
                          <label
                            htmlFor={`${field.id}-option-${index}`}
                            className='text-sm text-gray-700 hover:text-red-700 cursor-pointer'
                          >
                            {option}
                          </label>
                        </div>
                      ))}
                  </div>
                )}

                {field.fieldType === "dropdown" && field.options && field.options.length > 0 && (
                  <Select>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Select an option' />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options
                        .filter((option: any) => option && option.trim() !== "")
                        .map((option: any, index: number) => (
                          <SelectItem key={index} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}

                {field.fieldType === "checkbox" && field.options && field.options.length > 0 && (
                  <div className='space-y-2'>
                    {field.options
                      .filter((option: any) => option && option.trim() !== "")
                      .map((option: any, index: number) => (
                        <div key={index} className='flex items-center gap-2'>
                          <Checkbox id={`${field.id}-option-${index}`} />
                          <label
                            htmlFor={`${field.id}-option-${index}`}
                            className='text-sm text-gray-700 hover:text-red-700 cursor-pointer'
                          >
                            {option}
                          </label>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const NewQuestion = ({ customFields, setCustomFields, isNewQuestion, setIsNewQuestion, field, setField }: any) => {
  const form = useForm<z.infer<typeof formNewQuestionaire>>({
    resolver: zodResolver(formNewQuestionaire),
  });

  useEffect(() => {
    if (field) {
      form.reset({
        label: field.label || "",
        fieldType: field.fieldType || "",
        options: field.options || [],
        required: field.required,
      });
    }
  }, [field]);

  const { fields, append, remove } = useFieldArray<any>({
    control: form.control,
    name: "options",
  });

  const selectedFieldType: any = form.watch("fieldType"); // Watches the selected field type

  useEffect(() => {
    if (
      (selectedFieldType === "dropdown" || selectedFieldType === "checkbox" || selectedFieldType === "radio") &&
      fields.length === 0
    )
      append("");
  }, [selectedFieldType, append, fields.length]);

  const onSubmit = (values: z.infer<typeof formNewQuestionaire>) => {
    if (field) setCustomFields(customFields.map((f: any) => (f.id === field.id ? { ...f, ...values } : f)));
    else
      setCustomFields([
        ...customFields,
        { ...values, id: Date.now().toString(), required: values.required ? true : false },
      ]);

    setIsNewQuestion(false);
    setField(null);
  };

  return (
    <AlertDialog open={isNewQuestion} onOpenChange={() => setIsNewQuestion(false)}>
      <AlertDialogContent className='bg-transparent left-[50%] top-[50%] px-4'>
        <div className='rounded-lg px-4 sm:px-6 py-5 sm:py-6 bg-white'>
          <AlertDialogHeader className='flex-row gap-4'>
            <div className='flex justify-between items-center mb-4 gap-4 w-full'>
              <AlertDialogTitle className='text-black pb-2'>Add New Question</AlertDialogTitle>
              <XCircle
                onClick={() => {
                  form.reset({});
                  setIsNewQuestion(false);
                }}
                className='hover:text-red-700'
              />
            </div>
          </AlertDialogHeader>
          <Form {...form}>
            <form className='flex w-full flex-col gap-4'>
              <FormField
                control={form.control}
                name='label'
                render={({ field }) => (
                  <FormItem className='flex flex-col gap-2'>
                    <FormLabel>Question label</FormLabel>
                    <Input {...field} placeholder='Enter a question label' />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='fieldType'
                render={({ field }) => (
                  <FormItem className='flex flex-col gap-2'>
                    <FormLabel>Question type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className={cn(!field.value && "text-gray-400")}>
                        <SelectValue placeholder={field.value || "Select question type"} />
                      </SelectTrigger>
                      <SelectContent>
                        {questionTypes.map((question: any, index: number) => (
                          <SelectItem key={index} value={question.value}>
                            {question.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className='-top-3' />
                  </FormItem>
                )}
              />

              {selectedFieldType === "dropdown" || selectedFieldType === "checkbox" || selectedFieldType === "radio" ? (
                <FormField
                  control={form.control}
                  name='options'
                  render={() => (
                    <FormItem>
                      <FormLabel>Add options that users can select from</FormLabel>
                      <div className='flex flex-col gap-4'>
                        {fields.map((field, index) => (
                          <div key={field.id} className='flex items-center gap-4'>
                            <Input
                              {...form.register(`options.${index}`)}
                              placeholder={`${
                                selectedFieldType === "checkbox"
                                  ? "Checkbox"
                                  : selectedFieldType === "radio"
                                  ? "Radio"
                                  : "Dropdown"
                              } option ${index + 1}`}
                            />
                            <Trash2
                              onClick={() => remove(index)}
                              className='h-5 w-5 text-red-500 cursor-pointer hover:text-black'
                            />
                          </div>
                        ))}
                        <button
                          type='button'
                          className='mt-1 text-red-700 hover:text-black flex gap-1 items-center'
                          onClick={() => append("")}
                        >
                          <PlusCircle className='w-6 h-6' /> Add more options
                        </button>
                      </div>
                      <FormMessage className='-top-3' />
                    </FormItem>
                  )}
                />
              ) : null}

              <FormField
                control={form.control}
                name='required'
                render={({ field }) => (
                  <FormItem className='flex items-center gap-2 mt-3'>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    <FormLabel className='top-0 !mt-0'>Required field</FormLabel>
                  </FormItem>
                )}
              />

              <AlertDialogFooter className='flex my-[10px]'>
                <Button className='w-full' type='button' onClick={form.handleSubmit(onSubmit)}>
                  {field ? "Update" : "Add"} Question
                </Button>
              </AlertDialogFooter>
            </form>
          </Form>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const questionTemplates = [
  {
    value: "dietary",
    title: "Dietary Requirements",
    description: "Adds questions about dietary restrictions and special meal requirements",
  },
  {
    value: "accessibility",
    title: "Accessibility Needs",
    description: "Adds questions about accessibility accommodations and special requirements",
  },
  {
    value: "transportation",
    title: "Transportation & Parking",
    description: "Adds questions about transportation methods and parking needs",
  },
  {
    value: "contact",
    title: "Emergency Contact",
    description: "Adds fields for emergency contact information",
  },
];

const questionTypes = [
  {
    value: "text",
    label: "Text",
  },
  {
    value: "dropdown",
    label: "Dropdown",
  },
  {
    value: "checkbox",
    label: "Checkbox",
  },
  {
    value: "radio",
    label: "Radio",
  },
];
