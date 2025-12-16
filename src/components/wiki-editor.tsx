"use client";

import MDEditor from "@uiw/react-md-editor";
import { Upload, X } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createArticle, updateArticle } from "@/app/actions/articles";
import { uploadFile } from "@/app/actions/upload";

interface WikiEditorProps {
  initialTitle?: string;
  initialContent?: string;
  isEditing?: boolean;
  articleId?: string;
}

interface FormErrors {
  title?: string;
  content?: string;
}

export default function WikiEditor({
  initialTitle = "",
  initialContent = "",
  isEditing = false,
  articleId,
}: WikiEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!content.trim()) {
      newErrors.content = "Content is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      const newFiles = Array.from(selectedFiles);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  // Remove file
  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl: string | undefined;

      // Handle file uploads if there are any files
      if (files.length > 0) {
        // Upload the first file (you can extend this to handle multiple files)
        const uploadFormData = new FormData();
        uploadFormData.append("files", files[0]);

        try {
          const uploadedFile = await uploadFile(uploadFormData);
          imageUrl = uploadedFile.url;
        } catch (uploadError) {
          console.error("File upload error:", uploadError);
          // Continue without image if upload fails
        }
      }

      if (isEditing && articleId) {
        // Update existing article
        const result = await updateArticle(articleId, {
          title: title.trim(),
          content: content.trim(),
          imageUrl,
        });

        if (result.success) {
          // Navigate to the article page
          router.push(`/wiki/${articleId}`);
          router.refresh();
        }
      } else {
        // Create new article
        const result = await createArticle({
          title: title.trim(),
          content: content.trim(),
          imageUrl,
        });

        if (result.success && result.id) {
          // Navigate to the newly created article
          router.push(`/wiki/${result.id}`);
          router.refresh();
        } else {
          throw new Error("Failed to create article");
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "An error occurred while saving the article. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    const shouldLeave = window.confirm(
      "Are you sure you want to cancel? Any unsaved changes will be lost."
    );
    if (shouldLeave) {
      if (isEditing && articleId) {
        router.push(`/wiki/${articleId}`);
      } else {
        router.push("/");
      }
    }
  };

  const pageTitle = isEditing ? "Edit Article" : "Create New Article";

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{pageTitle}</h1>
        {isEditing && articleId && (
          <p className="text-muted-foreground mt-2">
            Editing article ID: {articleId}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Section */}
        <Card>
          <CardHeader>
            <CardTitle>Article Title</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                type="text"
                placeholder="Enter article title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Content Section */}
        <Card>
          <CardHeader>
            <CardTitle>Article Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="content">Content (Markdown) *</Label>
              <div
                className={`border rounded-md ${
                  errors.content ? "border-destructive" : ""
                }`}
              >
                <MDEditor
                  value={content}
                  onChange={(val) => setContent(val || "")}
                  preview="edit"
                  hideToolbar={false}
                  visibleDragbar={false}
                  textareaProps={{
                    placeholder: "Write your article content in Markdown...",
                    style: { fontSize: 14, lineHeight: 1.5 },
                  }}
                />
              </div>
              {errors.content && (
                <p className="text-sm text-destructive">{errors.content}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* File Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Attachments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <div className="space-y-2">
                  <Label
                    htmlFor="file-upload"
                    className="cursor-pointer text-sm font-medium"
                  >
                    Click to upload files
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Upload images, documents, or other files to attach to your
                    article
                  </p>
                </div>
                <Input
                  id="file-upload"
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="sr-only"
                />
              </div>

              {/* Display uploaded files */}
              {files.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Uploaded Files:</Label>
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div
                        // biome-ignore lint/suspicious/noArrayIndexKey: the order won't change
                        key={index}
                        className="flex items-center justify-between p-2 bg-muted rounded-md"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">
                            {file.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {submitError && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-sm text-destructive">{submitError}</p>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-w-[100px]"
              >
                {isSubmitting
                  ? "Saving..."
                  : isEditing
                    ? "Update Article"
                    : "Create Article"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
