"use client"

import { useState, useEffect } from "react"
import { getPatientFolders, uploadFileToPatientFolder, createPatientFolder } from "@/lib/webdav"
import {
  Heart,
  LayoutDashboard,
  Users,
  Folder,
  Settings,
  LogOut,
  Search,
  Download,
  Share2,
  Trash2,
  ChevronDown,
  AlertCircle,
  Plus,
  X,
  FileText,
  TrendingUp,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Patient {
  id: string
  fullName: string
  email: string
  phone: string
  dob: string
  gender: string
  address: string
  bloodType: string
  allergies: string
  medicalHistory: string
  fileCount: number
}

const INITIAL_PATIENTS: Patient[] = [
  {
    id: "1",
    fullName: "John Doe",
    email: "john.doe@example.com",
    phone: "555-1234",
    dob: "1985-04-12",
    gender: "Male",
    address: "123 Main St, City, State",
    bloodType: "O+",
    allergies: "Penicillin",
    medicalHistory: "Hypertension, Type 2 Diabetes",
    fileCount: 3,
  },
  {
    id: "2",
    fullName: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "555-5678",
    dob: "1990-07-22",
    gender: "Female",
    address: "456 Oak Ave, City, State",
    bloodType: "A-",
    allergies: "Latex",
    medicalHistory: "Asthma",
    fileCount: 2,
  },
  {
    id: "3",
    fullName: "Robert Brown",
    email: "robert.brown@example.com",
    phone: "555-9012",
    dob: "1978-11-05",
    gender: "Male",
    address: "789 Pine Rd, City, State",
    bloodType: "B+",
    allergies: "None",
    medicalHistory: "Clean",
    fileCount: 1,
  },
  {
    id: "4",
    fullName: "Emily White",
    email: "emily.white@example.com",
    phone: "555-3456",
    dob: "1988-03-18",
    gender: "Female",
    address: "321 Elm St, City, State",
    bloodType: "AB+",
    allergies: "Sulfonamides",
    medicalHistory: "Migraines",
    fileCount: 0,
  },
  {
    id: "5",
    fullName: "Michael Johnson",
    email: "michael.johnson@example.com",
    phone: "555-7890",
    dob: "1992-09-30",
    gender: "Male",
    address: "654 Maple Dr, City, State",
    bloodType: "O-",
    allergies: "Shellfish",
    medicalHistory: "None",
    fileCount: 4,
  },
]

const INITIAL_FILES = [
  { id: 1, name: "report-01.pdf", patient: "John Doe", type: "PDF", dateAdded: "2023-10-28" },
  { id: 2, name: "mri-scan.zip", patient: "Jane Smith", type: "ZIP", dateAdded: "2023-10-27" },
  { id: 3, name: "intake_form.docx", patient: "Robert Brown", type: "DOCX", dateAdded: "2023-10-25" },
]

const INITIAL_PATIENT_DETAILS: Record<string, { firstName: string; lastName: string; dob: string; email: string; phone: string; gender: string; bloodType: string; address: string; allergies: string; medicalHistory: string }> = {
  "David Johnson": { 
    firstName: "David", 
    lastName: "Johnson", 
    dob: "1975-03-12",
    email: "david.johnson@example.com",
    phone: "07700900345",
    gender: "Male",
    bloodType: "O+",
    address: "10 Downing Street, London, SW1A 2AA",
    allergies: "Penicillin",
    medicalHistory: "Seasonal Asthma"
  },
  "Ananya Gupta": { 
    firstName: "Ananya", 
    lastName: "Gupta", 
    dob: "1990-08-25",
    email: "ananya.gupta@example.com",
    phone: "09876543210",
    gender: "Female",
    bloodType: "B+",
    address: "Flat 401, Sapphire Towers, MG Road, Mumbai",
    allergies: "Dust",
    medicalHistory: "Mild Migraines"
  },
  "Emily White": { 
    firstName: "Emily", 
    lastName: "White", 
    dob: "1982-01-01",
    email: "emily.white@example.com",
    phone: "07890123456",
    gender: "Female",
    bloodType: "A-",
    address: "The Old Rectory, Village Green, Ruralshire",
    allergies: "Shellfish",
    medicalHistory: "Gluten Intolerance"
  },
  "Rohan Mehta": { 
    firstName: "Rohan", 
    lastName: "Mehta", 
    dob: "1968-04-17",
    email: "rohan.mehta@example.com",
    phone: "09123456789",
    gender: "Male",
    bloodType: "AB-",
    address: "House No. 22, Green Avenue, Chennai",
    allergies: "NKA (No Known Allergies)",
    medicalHistory: "Controlled Hypertension"
  },
  "Sarah Davies": { 
    firstName: "Sarah", 
    lastName: "Davies", 
    dob: "1995-11-29",
    email: "sarah.davies@example.com",
    phone: "07950517270",
    gender: "Female",
    bloodType: "O-",
    address: "Apartment 5, City Centre, Manchester",
    allergies: "Bee Stings",
    medicalHistory: "Recurrent Ear Infections"
  },
}

interface AdminProfile {
  name: string
  email: string
  role: string
}

const INITIAL_ADMIN_PROFILE: AdminProfile = {
  name: "Dr. Smith",
  email: "dr.smith@clinic.com",
  role: "Administrator",
}

export default function HealthFileDashboard() {
  const [sidebarPage, setSidebarPage] = useState("dashboard")
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [selectedPatientForUpload, setSelectedPatientForUpload] = useState<string | null>("John Doe")
  const [files, setFiles] = useState(INITIAL_FILES)
  const [searchQuery, setSearchQuery] = useState("")
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [patientDetails, setPatientDetails] = useState(INITIAL_PATIENT_DETAILS)
  const [editingPatient, setEditingPatient] = useState<string | null>(null)
  const [tempPatientData, setTempPatientData] = useState<{ firstName: string; lastName: string; dob: string } | null>(
    null,
  )
  const [adminProfile, setAdminProfile] = useState(INITIAL_ADMIN_PROFILE)
  const [editingProfile, setEditingProfile] = useState(false)
  const [tempProfileData, setTempProfileData] = useState(INITIAL_ADMIN_PROFILE)
  const [fileManagerFilter, setFileManagerFilter] = useState<string | null>("John Doe")

  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS)
  const [selectedPatientDetail, setSelectedPatientDetail] = useState<Patient | null>(null)
  const [showAddPatientModal, setShowAddPatientModal] = useState(false)
  const [showPatientDetailModal, setShowPatientDetailModal] = useState(false)
  const [editingPatientDetail, setEditingPatientDetail] = useState(false)
  const [tempPatientDetail, setTempPatientDetail] = useState<Patient | null>(null)
  const [newPatientForm, setNewPatientForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    address: "",
    bloodType: "",
    allergies: "",
    medicalHistory: "",
  })

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const folders = await getPatientFolders()
        if (folders.length > 0) {
          const mapped = folders.map((name, idx) => {
            const details = INITIAL_PATIENT_DETAILS[name] || { 
              firstName: name.split(' ')[0] || '', 
              lastName: name.split(' ')[1] || '', 
              dob: '',
              email: '',
              phone: '',
              gender: '',
              bloodType: '',
              address: '',
              allergies: '',
              medicalHistory: ''
            }
            return {
              id: `patient-${Date.now()}-${idx}`, // Unique ID using timestamp
              fullName: name,
              email: details.email || (details.firstName ? `${details.firstName.toLowerCase()}.${details.lastName.toLowerCase()}@example.com` : ''),
              phone: details.phone || '',
              dob: details.dob || '',
              gender: details.gender || '',
              address: details.address || '',
              bloodType: details.bloodType || '',
              allergies: details.allergies || '',
              medicalHistory: details.medicalHistory || '',
              fileCount: 0,
            }
          })
          setPatients(mapped)
        }
      } catch (err) {
        console.error("Failed to load patients from Nextcloud", err)
        // Keep initial patients
      }
    }
    loadPatients()
  }, [])

  const patientNames = patients.map((p) => p.fullName)
  const totalFiles = files.length
  const totalPatients = patients.length
  const recentFiles = files.slice().reverse().slice(0, 3)

  const handleFileUpload = () => {
    if (!uploadedFile || !selectedPatientForUpload) return

    // Upload the file to Nextcloud
    const doUpload = async () => {
      try {
        await uploadFileToPatientFolder(selectedPatientForUpload, uploadedFile)

        const newFile = {
          id: Math.max(...files.map((f) => f.id), 0) + 1,
          name: uploadedFile.name,
          patient: selectedPatientForUpload,
          type: uploadedFile.name.split(".").pop()?.toUpperCase() || "FILE",
          dateAdded: new Date().toISOString().split("T")[0],
        }

        setFiles((prev) => [...prev, newFile])
        setUploadedFile(null)
        setSelectedPatientForUpload(null)
        setUploadSuccess(true)
        setTimeout(() => setUploadSuccess(false), 3000)
      } catch (err: any) {
        console.error("Upload failed", err)
        alert(`Upload failed: ${err?.message || String(err)}`)
      }
    }

    void doUpload()
  }

  const handleDeleteFile = (fileId: number) => {
    setFiles(files.filter((f) => f.id !== fileId))
  }

  const handleDownloadFile = (fileName: string) => {
    console.log("[v0] Download initiated for:", fileName)
    // NextCloud will handle actual download
  }

  const handleShareFile = (fileName: string) => {
    console.log("[v0] Share initiated for:", fileName)
    // NextCloud will handle actual sharing
  }

  const handleEditPatient = (patientName: string) => {
    setEditingPatient(patientName)
    setTempPatientData({ ...patientDetails[patientName] })
  }

  const handleSavePatient = () => {
    if (editingPatient && tempPatientData) {
      setPatientDetails({
        ...patientDetails,
        [editingPatient]: tempPatientData,
      })
      setEditingPatient(null)
      setTempPatientData(null)
    }
  }

  const handleCancelEditPatient = () => {
    setEditingPatient(null)
    setTempPatientData(null)
  }

  const handleEditProfile = () => {
    setEditingProfile(true)
    setTempProfileData({ ...adminProfile })
  }

  const handleSaveProfile = () => {
    setAdminProfile({ ...tempProfileData })
    setEditingProfile(false)
  }

  const handleCancelEditProfile = () => {
    setEditingProfile(false)
    setTempProfileData(INITIAL_ADMIN_PROFILE)
  }

  const handleLogout = () => {
    console.log("[v0] User logged out")
  }

  const handleAddPatient = async () => {
    if (!newPatientForm.fullName || !newPatientForm.email) return

    try {
      // Create folder in Nextcloud with metadata
      await createPatientFolder(newPatientForm.fullName, {
        email: newPatientForm.email,
        phone: newPatientForm.phone,
        dob: newPatientForm.dob,
        gender: newPatientForm.gender,
        address: newPatientForm.address,
        bloodType: newPatientForm.bloodType,
        allergies: newPatientForm.allergies,
        medicalHistory: newPatientForm.medicalHistory,
      })

      const newPatient: Patient = {
        id: `patient-${Date.now()}`,
        ...newPatientForm,
        fileCount: 0,
      }

      setPatients([...patients, newPatient])
      setNewPatientForm({
        fullName: "",
        email: "",
        phone: "",
        dob: "",
        gender: "",
        address: "",
        bloodType: "",
        allergies: "",
        medicalHistory: "",
      })
      setShowAddPatientModal(false)
    } catch (error: any) {
      console.error("Failed to add patient:", error)
      alert(`Failed to add patient: ${error?.message || String(error)}`)
    }
  }

  const handleOpenPatientDetail = (patient: Patient) => {
    setSelectedPatientDetail(patient)
    setShowPatientDetailModal(true)
  }

  const handleSavePatientDetail = () => {
    if (!tempPatientDetail) return

    setPatients(patients.map((p) => (p.id === tempPatientDetail.id ? tempPatientDetail : p)))
    setSelectedPatientDetail(tempPatientDetail)
    setEditingPatientDetail(false)
  }

  const handleCancelEditPatientDetail = () => {
    setEditingPatientDetail(false)
    setTempPatientDetail(null)
  }

  const handleDeletePatient = (patientId: string) => {
    setPatients(patients.filter((p) => p.id !== patientId))
    if (selectedPatientDetail?.id === patientId) {
      setShowPatientDetailModal(false)
      setSelectedPatientDetail(null)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-64 border-r border-border bg-sidebar text-sidebar-foreground flex flex-col">
        {/* Logo Section */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-blue-500 fill-blue-500" />
            <h1 className="text-xl font-bold">HealthFile</h1>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-6 space-y-2">
          <button
            onClick={() => setSidebarPage("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              sidebarPage === "dashboard"
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent"
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setSidebarPage("patients")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              sidebarPage === "patients"
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent"
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Patients</span>
          </button>
          <button
            onClick={() => setSidebarPage("file-manager")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              sidebarPage === "file-manager"
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent"
            }`}
          >
            <Folder className="w-5 h-5" />
            <span>File Manager</span>
          </button>
          <button
            onClick={() => setSidebarPage("settings")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              sidebarPage === "settings"
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent"
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
        </nav>

        {/* User Profile Section */}
        <div className="p-6 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>DS</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold text-sm">{adminProfile.name}</p>
              <p className="text-xs text-sidebar-foreground/60">{adminProfile.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        <header className="border-b border-border bg-card px-8 py-4 flex items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                className="pl-10 bg-input border-border"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <Button variant="outline" className="gap-2 bg-transparent" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">
            {sidebarPage === "dashboard" && (
              <>
                <h1 className="text-4xl font-bold mb-8 text-foreground">Dashboard</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {/* Total Patients Card */}
                  <Card className="bg-card hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground font-medium">Total Patients</p>
                          <p className="text-4xl font-bold text-foreground mt-2">{totalPatients}</p>
                          <p className="text-xs text-muted-foreground mt-2">Active records</p>
                        </div>
                        <div className="p-3 bg-blue-500/10 rounded-lg">
                          <Users className="w-6 h-6 text-blue-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Total Files Card */}
                  <Card className="bg-card hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground font-medium">Total Files</p>
                          <p className="text-4xl font-bold text-foreground mt-2">{totalFiles}</p>
                          <p className="text-xs text-muted-foreground mt-2">Documents uploaded</p>
                        </div>
                        <div className="p-3 bg-green-500/10 rounded-lg">
                          <FileText className="w-6 h-6 text-green-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Average Files per Patient */}
                  <Card className="bg-card hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground font-medium">Avg Files/Patient</p>
                          <p className="text-4xl font-bold text-foreground mt-2">
                            {totalPatients > 0 ? (totalFiles / totalPatients).toFixed(1) : 0}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">Per patient average</p>
                        </div>
                        <div className="p-3 bg-purple-500/10 rounded-lg">
                          <TrendingUp className="w-6 h-6 text-purple-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Files Section */}
                <Card className="mb-8">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Recent Files</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSidebarPage("file-manager")}
                        className="bg-transparent"
                      >
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {recentFiles.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <FileText className="w-10 h-10 text-muted-foreground mb-3 opacity-50" />
                        <p className="text-muted-foreground">No files uploaded yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {recentFiles.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div className="p-2 bg-blue-500/10 rounded">
                                <FileText className="w-4 h-4 text-blue-500" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-foreground">{file.name}</p>
                                <p className="text-sm text-muted-foreground">{file.patient}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-xs text-muted-foreground">{file.dateAdded}</p>
                                <p className="text-xs font-medium text-foreground">{file.type}</p>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <ChevronDown className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem className="gap-2" onClick={() => handleDownloadFile(file.name)}>
                                    <Download className="w-4 h-4" />
                                    Download
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="gap-2" onClick={() => handleShareFile(file.name)}>
                                    <Share2 className="w-4 h-4" />
                                    Share
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="gap-2 text-red-600"
                                    onClick={() => handleDeleteFile(file.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Upload Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>Upload New File</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {uploadSuccess && (
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                        <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <p className="text-sm font-medium text-green-600">File uploaded successfully!</p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Select Patient</label>
                        <Select
                          value={selectedPatientForUpload || "John Doe"}
                          onValueChange={setSelectedPatientForUpload}
                        >
                          <SelectTrigger className="bg-input border-border">
                            <SelectValue placeholder="Choose a patient..." />
                          </SelectTrigger>
                          <SelectContent>
                            {patientNames.map((patient) => (
                              <SelectItem key={patient} value={patient}>
                                {patient}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Upload File</label>
                        <Input
                          type="file"
                          className="bg-input border-border cursor-pointer"
                          onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                        />
                      </div>
                      <div className="space-y-2 flex flex-col justify-end">
                        <Button
                          onClick={handleFileUpload}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={!uploadedFile || !selectedPatientForUpload}
                        >
                          Upload
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {sidebarPage === "patients" && (
              <>
                <div className="flex items-center justify-between mb-8">
                  <h1 className="text-4xl font-bold text-foreground">Patients</h1>
                  <Button
                    onClick={() => setShowAddPatientModal(true)}
                    className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="w-5 h-5" />
                    Add Patient
                  </Button>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>Patient List ({patients.length} patients)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {patients.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Users className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                        <p className="text-muted-foreground">No patients yet. Add one to get started.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {patients.map((patient) => (
                          <div
                            key={patient.id}
                            onClick={() => handleOpenPatientDetail(patient)}
                            className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-4 flex-1">
                              <Avatar>
                                <AvatarFallback>
                                  {patient.fullName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="font-medium text-foreground">{patient.fullName}</p>
                                <p className="text-sm text-muted-foreground">{patient.email}</p>
                                <p className="text-xs text-muted-foreground">DOB: {patient.dob}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-foreground">{patient.fileCount} files</p>
                              <p className="text-xs text-muted-foreground">{patient.bloodType}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {sidebarPage === "file-manager" && (
              <>
                <h1 className="text-4xl font-bold mb-8 text-foreground">File Manager</h1>
                <Card>
                  <CardHeader>
                    <CardTitle>
                      All Files (
                      {
                        files.filter(
                          (f) => fileManagerFilter === "all" || !fileManagerFilter || f.patient === fileManagerFilter,
                        ).length
                      }{" "}
                      total)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Filter by Patient</label>
                      <Select
                        value={fileManagerFilter === "all" || !fileManagerFilter ? "all" : fileManagerFilter}
                        onValueChange={(val) => setFileManagerFilter(val === "all" ? "all" : val)}
                      >
                        <SelectTrigger className="bg-input border-border max-w-xs">
                          <SelectValue placeholder="All patients" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All patients</SelectItem>
                          {patientNames.map((patient) => (
                            <SelectItem key={patient} value={patient}>
                              {patient}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {files.filter(
                      (f) => fileManagerFilter === "all" || !fileManagerFilter || f.patient === fileManagerFilter,
                    ).length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Folder className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                        <p className="text-muted-foreground">No files uploaded yet</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>File Name</TableHead>
                              <TableHead>Patient</TableHead>
                              <TableHead>File Type</TableHead>
                              <TableHead>Date Added</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {files
                              .filter(
                                (f) =>
                                  fileManagerFilter === "all" || !fileManagerFilter || f.patient === fileManagerFilter,
                              )
                              .map((file) => (
                                <TableRow key={file.id}>
                                  <TableCell className="font-medium">{file.name}</TableCell>
                                  <TableCell>{file.patient}</TableCell>
                                  <TableCell>
                                    <span className="px-2 py-1 rounded-full bg-blue-500/10 text-blue-600 text-sm font-medium">
                                      {file.type}
                                    </span>
                                  </TableCell>
                                  <TableCell>{file.dateAdded}</TableCell>
                                  <TableCell className="text-right">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                          <ChevronDown className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                          className="gap-2"
                                          onClick={() => handleDownloadFile(file.name)}
                                        >
                                          <Download className="w-4 h-4" />
                                          Download
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="gap-2" onClick={() => handleShareFile(file.name)}>
                                          <Share2 className="w-4 h-4" />
                                          Share
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          className="gap-2 text-red-600"
                                          onClick={() => handleDeleteFile(file.id)}
                                        >
                                          <Trash2 className="w-4 h-4" />
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {sidebarPage === "settings" && (
              <>
                <h1 className="text-4xl font-bold mb-8 text-foreground">Settings</h1>
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {editingProfile ? (
                      <>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Name</label>
                          <Input
                            value={tempProfileData.name}
                            onChange={(e) => setTempProfileData({ ...tempProfileData, name: e.target.value })}
                            className="bg-input border-border"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Email</label>
                          <Input
                            value={tempProfileData.email}
                            onChange={(e) => setTempProfileData({ ...tempProfileData, email: e.target.value })}
                            className="bg-input border-border"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Role</label>
                          <Input
                            value={tempProfileData.role}
                            onChange={(e) => setTempProfileData({ ...tempProfileData, role: e.target.value })}
                            className="bg-input border-border"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleSaveProfile} className="bg-green-600 hover:bg-green-700 text-white">
                            Save Changes
                          </Button>
                          <Button onClick={handleCancelEditProfile} variant="outline" className="bg-transparent">
                            Cancel
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Name</label>
                          <Input
                            value={adminProfile.name}
                            readOnly
                            className="bg-input border-border cursor-not-allowed"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Email</label>
                          <Input
                            value={adminProfile.email}
                            readOnly
                            className="bg-input border-border cursor-not-allowed"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Role</label>
                          <Input
                            value={adminProfile.role}
                            readOnly
                            className="bg-input border-border cursor-not-allowed"
                          />
                        </div>
                        <Button onClick={handleEditProfile} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                          Edit Profile
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </main>

      {showAddPatientModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-auto">
            <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-card border-b">
              <CardTitle>Add New Patient</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowAddPatientModal(false)} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Full Name</label>
                  <Input
                    value={newPatientForm.fullName}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, fullName: e.target.value })}
                    placeholder="John Doe"
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <Input
                    value={newPatientForm.email}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, email: e.target.value })}
                    placeholder="john@example.com"
                    type="email"
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Phone</label>
                  <Input
                    value={newPatientForm.phone}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, phone: e.target.value })}
                    placeholder="555-1234"
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Date of Birth</label>
                  <Input
                    value={newPatientForm.dob}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, dob: e.target.value })}
                    type="date"
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Gender</label>
                  <Select
                    value={newPatientForm.gender}
                    onValueChange={(val) => setNewPatientForm({ ...newPatientForm, gender: val })}
                  >
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Address</label>
                  <Input
                    value={newPatientForm.address}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, address: e.target.value })}
                    placeholder="123 Main St"
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Blood Type</label>
                  <Select
                    value={newPatientForm.bloodType}
                    onValueChange={(val) => setNewPatientForm({ ...newPatientForm, bloodType: val })}
                  >
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue placeholder="Select blood type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Allergies</label>
                  <Input
                    value={newPatientForm.allergies}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, allergies: e.target.value })}
                    placeholder="Penicillin, Latex"
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Medical History</label>
                  <Input
                    value={newPatientForm.medicalHistory}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, medicalHistory: e.target.value })}
                    placeholder="Hypertension, Diabetes"
                    className="bg-input border-border"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleAddPatient} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                  Add Patient
                </Button>
                <Button
                  onClick={() => setShowAddPatientModal(false)}
                  variant="outline"
                  className="flex-1 bg-transparent"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showPatientDetailModal && selectedPatientDetail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
            <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-card border-b">
              <CardTitle>Patient Details</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPatientDetailModal(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {editingPatientDetail ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Full Name</label>
                      <Input
                        value={tempPatientDetail?.fullName || ""}
                        onChange={(e) => setTempPatientDetail({ ...tempPatientDetail!, fullName: e.target.value })}
                        className="bg-input border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Email</label>
                      <Input
                        value={tempPatientDetail?.email || ""}
                        onChange={(e) => setTempPatientDetail({ ...tempPatientDetail!, email: e.target.value })}
                        className="bg-input border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Phone</label>
                      <Input
                        value={tempPatientDetail?.phone || ""}
                        onChange={(e) => setTempPatientDetail({ ...tempPatientDetail!, phone: e.target.value })}
                        className="bg-input border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Date of Birth</label>
                      <Input
                        value={tempPatientDetail?.dob || ""}
                        onChange={(e) => setTempPatientDetail({ ...tempPatientDetail!, dob: e.target.value })}
                        type="date"
                        className="bg-input border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Gender</label>
                      <Input
                        value={tempPatientDetail?.gender || ""}
                        onChange={(e) => setTempPatientDetail({ ...tempPatientDetail!, gender: e.target.value })}
                        className="bg-input border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Blood Type</label>
                      <Input
                        value={tempPatientDetail?.bloodType || ""}
                        onChange={(e) => setTempPatientDetail({ ...tempPatientDetail!, bloodType: e.target.value })}
                        className="bg-input border-border"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-foreground">Address</label>
                      <Input
                        value={tempPatientDetail?.address || ""}
                        onChange={(e) => setTempPatientDetail({ ...tempPatientDetail!, address: e.target.value })}
                        className="bg-input border-border"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-foreground">Allergies</label>
                      <Input
                        value={tempPatientDetail?.allergies || ""}
                        onChange={(e) => setTempPatientDetail({ ...tempPatientDetail!, allergies: e.target.value })}
                        className="bg-input border-border"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-foreground">Medical History</label>
                      <Input
                        value={tempPatientDetail?.medicalHistory || ""}
                        onChange={(e) =>
                          setTempPatientDetail({ ...tempPatientDetail!, medicalHistory: e.target.value })
                        }
                        className="bg-input border-border"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleSavePatientDetail}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      Save Changes
                    </Button>
                    <Button onClick={handleCancelEditPatientDetail} variant="outline" className="flex-1 bg-transparent">
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                      <p className="text-lg font-semibold text-foreground">{selectedPatientDetail.fullName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p className="text-lg font-semibold text-foreground">{selectedPatientDetail.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Phone</p>
                      <p className="text-lg font-semibold text-foreground">{selectedPatientDetail.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                      <p className="text-lg font-semibold text-foreground">{selectedPatientDetail.dob}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Gender</p>
                      <p className="text-lg font-semibold text-foreground">{selectedPatientDetail.gender}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Blood Type</p>
                      <p className="text-lg font-semibold text-foreground">{selectedPatientDetail.bloodType}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-muted-foreground">Address</p>
                      <p className="text-lg font-semibold text-foreground">{selectedPatientDetail.address}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-muted-foreground">Allergies</p>
                      <p className="text-lg font-semibold text-foreground">{selectedPatientDetail.allergies}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-muted-foreground">Medical History</p>
                      <p className="text-lg font-semibold text-foreground">{selectedPatientDetail.medicalHistory}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => {
                        setEditingPatientDetail(true)
                        setTempPatientDetail({ ...selectedPatientDetail })
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Edit Patient
                    </Button>
                    <Button
                      onClick={() => handleDeletePatient(selectedPatientDetail.id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    >
                      Delete Patient
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
