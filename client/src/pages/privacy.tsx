import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Shield, Lock, Eye, Database, Users, Globe, Download, UserX, AlertCircle } from "lucide-react";

export default function Privacy() {
  const { toast } = useToast();

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/auth/delete-account");
    },
    onSuccess: () => {
      toast({
        title: "Account Deleted",
        description: "Your account and all data have been permanently deleted.",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again or contact support.",
        variant: "destructive",
      });
    },
  });

  const downloadDataMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/export-data", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to export data");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "yesnoapp-data-export.json";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast({
        title: "Data Exported",
        description: "Your data has been downloaded successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Export Failed",
        description: "Failed to export your data. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-ios-bg via-white to-ios-gray-50 pt-20 pb-24">
      <div className="container-padding">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center">
            <Shield className="w-16 h-16 text-ios-blue mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-ios-text mb-4">Privacy Policy & GDPR</h1>
            <p className="text-xl text-ios-secondary">
              Your privacy and data protection are our top priorities
            </p>
            <p className="text-sm text-ios-secondary mt-2">
              Last updated: June 2025
            </p>
          </div>

          {/* GDPR Rights */}
          <Card className="border-ios-blue/20 bg-ios-blue/5">
            <CardHeader>
              <CardTitle className="flex items-center text-ios-blue">
                <Eye className="w-5 h-5 mr-3" />
                Your GDPR Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-ios-text">
                Under the General Data Protection Regulation (GDPR), you have the following rights regarding your personal data:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-sm">Right to Access</h3>
                    <p className="text-xs text-ios-secondary">View all data we have about you</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Right to Rectification</h3>
                    <p className="text-xs text-ios-secondary">Correct inaccurate or incomplete data</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Right to Erasure</h3>
                    <p className="text-xs text-ios-secondary">Delete your account and all associated data</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-sm">Right to Portability</h3>
                    <p className="text-xs text-ios-secondary">Export your data in a readable format</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Right to Object</h3>
                    <p className="text-xs text-ios-secondary">Opt out of certain data processing</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Right to Restriction</h3>
                    <p className="text-xs text-ios-secondary">Limit how we process your data</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  onClick={() => downloadDataMutation.mutate()}
                  disabled={downloadDataMutation.isPending}
                  className="flex-1"
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {downloadDataMutation.isPending ? "Exporting..." : "Download My Data"}
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="flex-1">
                      <UserX className="w-4 h-4 mr-2" />
                      Delete My Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center text-danger-red">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        Delete Account Permanently
                      </AlertDialogTitle>
                      <AlertDialogDescription className="space-y-3">
                        <p>
                          This action cannot be undone. This will permanently delete your account and remove all your data from our servers, including:
                        </p>
                        <ul className="text-sm space-y-1 ml-4">
                          <li>• Your profile and personal information</li>
                          <li>• All food analysis history</li>
                          <li>• Progress tracking and achievements</li>
                          <li>• Subscription information</li>
                          <li>• All associated data and preferences</li>
                        </ul>
                        <p className="text-danger-red font-medium">
                          You will lose access to your account immediately and all data will be permanently erased within 30 days.
                        </p>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteAccountMutation.mutate()}
                        className="bg-danger-red hover:bg-danger-red/90"
                        disabled={deleteAccountMutation.isPending}
                      >
                        {deleteAccountMutation.isPending ? "Deleting..." : "Delete Account"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Overview */}
          <Card className="bg-ios-blue/5 border-ios-blue/20">
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="w-8 h-8 text-ios-blue" />
                <h2 className="text-2xl font-bold">Our Privacy Commitment</h2>
              </div>
              <p className="text-lg leading-relaxed">
                YesNoApp is built with privacy-first principles. We minimize data collection, 
                maximize on-device processing, and give you complete control over your information. 
                Your health data belongs to you, and we're just here to help you make better choices.
              </p>
            </CardContent>
          </Card>

          {/* What We Collect */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="w-6 h-6" />
                <span>What Information We Collect</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Account Information</h3>
                <ul className="space-y-2 text-ios-secondary">
                  <li>• Email address (for account creation and communication)</li>
                  <li>• Name (to personalize your experience)</li>
                  <li>• Profile picture (optional, from your authentication provider)</li>
                  <li>• Subscription and billing information (for paid plans)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Health & Nutrition Data</h3>
                <ul className="space-y-2 text-ios-secondary">
                  <li>• Food photos and descriptions you submit for analysis</li>
                  <li>• Your dietary preferences and health goals</li>
                  <li>• Food analysis results and verdicts</li>
                  <li>• Allergies and medical conditions (only if you provide them)</li>
                  <li>• Progress tracking and usage statistics</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Technical Information</h3>
                <ul className="space-y-2 text-ios-secondary">
                  <li>• Device type and operating system</li>
                  <li>• App usage patterns and performance metrics</li>
                  <li>• IP address and general location (for service optimization)</li>
                  <li>• Crash reports and error logs (anonymized)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Questions About Privacy?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-ios-secondary mb-4">
                We're here to help you understand how your data is protected. Contact our privacy team:
              </p>
              <div className="space-y-2 text-sm">
                <p><strong>Email:</strong> privacy@yesnoapp.com</p>
                <p><strong>Data Protection Officer:</strong> dpo@yesnoapp.com</p>
                <p><strong>Address:</strong> YesNoApp, Inc. Privacy Team, [Address]</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}