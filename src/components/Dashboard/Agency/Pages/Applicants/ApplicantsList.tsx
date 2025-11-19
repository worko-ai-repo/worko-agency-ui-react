import SearchBar from '@Components/Shared/SearchBar'
import SkeletonLoader from '@Components/Shared/SkeletonLoader'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import GenericDropdownAgency from '@Components/Shared/DropDown/GenericDropdownAgency'
import ApplicantsListTable from './ApplicantsListTable'
import { useAppContext } from '@Context/App.context'
import httpServiceObj from '@Services/ApiHandler.service'
import { AgencyApplicantsListDetailsDto } from '@Interfaces/AgencyDashboardList.dto'

  const dummyData = [
    {
      id: "ref-10",
      pk: "REFERRAL#ref-10",
      sk: "CANDIDATE#ref-10",
      companyName: "Cloud Engineer",
      jobProfile: "TechHire Solutions",
      dateSubmitted: "2025-10-05",
      applicantName: "Abhay Raj",
      emailId: "abhay.raj@example.com",
      contactNumber: "+91-9876543219",
      currentCompany: "NetCloud",
      currentDesignation: "AWS Engineer",
      totalYOE: 6,
      relevantYOE: 4,
      currentCTC: "16 LPA",
      expectedCTC: "19 LPA",
      noticePeriod: "30 days",
      location: "Hyderabad",
      readyToRelocate: true,
      comments: "Certified AWS Solutions Architect.",
      cvLink: "https://calibre-ebook.com/downloads/demos/demo.pdf",
      currentStatus: "APPLIED"
    },
    {
      id: "ref-11",
      pk: "REFERRAL#ref-11",
      sk: "CANDIDATE#ref-11",
      jobProfile: "Frontend Developer",
      companyName: "PixelRecruit",
      dateSubmitted: "2025-10-06",
      applicantName: "Neha Sharma",
      emailId: "neha.sharma@example.com",
      contactNumber: "+91-9823123456",
      currentCompany: "Designify",
      currentDesignation: "React Developer",
      totalYOE: 4,
      relevantYOE: 3,
      currentCTC: "10 LPA",
      expectedCTC: "12 LPA",
      noticePeriod: "15 days",
      location: "Bangalore",
      readyToRelocate: false,
      comments: "Strong in UI/UX integration.",
      cvLink: "https://example.com/cv/neha-sharma.pdf",
      currentStatus: "PROCESSING_INTERVIEW"
    },
    {
      id: "ref-12",
      pk: "REFERRAL#ref-12",
      sk: "CANDIDATE#ref-12",
      jobProfile: "Data Analyst",
      companyName: "Insight Partners",
      dateSubmitted: "2025-10-07",
      applicantName: "Rohan Mehta",
      emailId: "rohan.mehta@example.com",
      contactNumber: "+91-9811122233",
      currentCompany: "DataWise",
      currentDesignation: "Junior Data Analyst",
      totalYOE: 3,
      relevantYOE: 2,
      currentCTC: "7 LPA",
      expectedCTC: "9 LPA",
      noticePeriod: "60 days",
      location: "Pune",
      readyToRelocate: true,
      comments: "Hands-on with Power BI and SQL.",
      cvLink: "https://example.com/cv/rohan-mehta.pdf",
      currentStatus: "HIRING_IN_PROCESS"
    },
    {
      id: "ref-13",
      pk: "REFERRAL#ref-13",
      sk: "CANDIDATE#ref-13",
      jobProfile: "DevOps Engineer",
      companyName: "CloudBridge",
      dateSubmitted: "2025-10-07",
      applicantName: "Sana Ali",
      emailId: "sana.ali@example.com",
      contactNumber: "+91-9876543210",
      currentCompany: "InfraEdge",
      currentDesignation: "DevOps Specialist",
      totalYOE: 5,
      relevantYOE: 4,
      currentCTC: "13 LPA",
      expectedCTC: "15.5 LPA",
      noticePeriod: "45 days",
      location: "Chennai",
      readyToRelocate: false,
      comments: "Expert in CI/CD pipelines and Docker.",
      cvLink: "https://example.com/cv/sana-ali.pdf",
      currentStatus: "REJECTED"
    },
    {
      id: "ref-14",
      pk: "REFERRAL#ref-14",
      sk: "CANDIDATE#ref-14",
      jobProfile: "Backend Developer",
      companyName: "CodeSearch",
      dateSubmitted: "2025-10-08",
      applicantName: "Manish Kumar",
      emailId: "manish.kumar@example.com",
      contactNumber: "+91-9900887766",
      currentCompany: "StackCore",
      currentDesignation: "Node.js Developer",
      totalYOE: 4,
      relevantYOE: 3,
      currentCTC: "11 LPA",
      expectedCTC: "13.5 LPA",
      noticePeriod: "30 days",
      location: "Gurgaon",
      readyToRelocate: true,
      comments: "Strong API development experience.",
      cvLink: "https://example.com/cv/manish-kumar.pdf",
      currentStatus: "HIRED"
    },
    {
      id: "ref-15",
      pk: "REFERRAL#ref-15",
      sk: "CANDIDATE#ref-15",
      jobProfile: "Full Stack Developer",
      companyName: "NextHire",
      dateSubmitted: "2025-10-08",
      applicantName: "Priya Sen",
      emailId: "priya.sen@example.com",
      contactNumber: "+91-9922334455",
      currentCompany: "TechNova",
      currentDesignation: "Software Engineer",
      totalYOE: 5,
      relevantYOE: 3.5,
      currentCTC: "12.5 LPA",
      expectedCTC: "15 LPA",
      noticePeriod: "20 days",
      location: "Mumbai",
      readyToRelocate: true,
      comments: "Experienced in MERN stack and Agile.",
      cvLink: "https://example.com/cv/priya-sen.pdf",
      currentStatus: "JOINED"
    },
    {
      id: "ref-16",
      pk: "REFERRAL#ref-16",
      sk: "CANDIDATE#ref-16",
      jobProfile: "QA Engineer",
      companyName: "TestLab",
      dateSubmitted: "2025-10-09",
      applicantName: "Ankit Jha",
      emailId: "ankit.jha@example.com",
      contactNumber: "+91-9812233445",
      currentCompany: "QualitySoft",
      currentDesignation: "QA Analyst",
      totalYOE: 3,
      relevantYOE: 2,
      currentCTC: "8 LPA",
      expectedCTC: "10 LPA",
      noticePeriod: "15 days",
      location: "Noida",
      readyToRelocate: false,
      comments: "Good in manual and automation testing.",
      cvLink: "https://example.com/cv/ankit-jha.pdf",
      currentStatus: "OFFER_SENT"
    },
    {
      id: "ref-17",
      pk: "REFERRAL#ref-17",
      sk: "CANDIDATE#ref-17",
      jobProfile: "UI/UX Designer",
      companyName: "DesignCrew",
      dateSubmitted: "2025-10-09",
      applicantName: "Tanvi Kapoor",
      emailId: "tanvi.kapoor@example.com",
      contactNumber: "+91-9800011223",
      currentCompany: "VisualMint",
      currentDesignation: "Product Designer",
      totalYOE: 4,
      relevantYOE: 4,
      currentCTC: "9.5 LPA",
      expectedCTC: "11.5 LPA",
      noticePeriod: "25 days",
      location: "Delhi",
      readyToRelocate: true,
      comments: "Strong portfolio and Figma skills.",
      cvLink: "https://example.com/cv/tanvi-kapoor.pdf",
      currentStatus: "DOCUMENT_REQUESTED"
    },
    {
      id: "ref-18",
      pk: "REFERRAL#ref-18",
      sk: "CANDIDATE#ref-18",
      jobProfile: "Product Manager",
      companyName: "PMConnect",
      dateSubmitted: "2025-10-10",
      applicantName: "Arjun Desai",
      emailId: "arjun.desai@example.com",
      contactNumber: "+91-9876501234",
      currentCompany: "Innovix",
      currentDesignation: "Associate Product Manager",
      totalYOE: 6,
      relevantYOE: 4,
      currentCTC: "18 LPA",
      expectedCTC: "22 LPA",
      noticePeriod: "60 days",
      location: "Remote",
      readyToRelocate: false,
      comments: "Led cross-functional product teams.",
      cvLink: "https://example.com/cv/arjun-desai.pdf",
      currentStatus: "INTERVIEW_DONE"
    },
    {
      id: "ref-19",
      pk: "REFERRAL#ref-19",
      sk: "CANDIDATE#ref-19",
      jobProfile: "Cybersecurity Analyst",
      companyName: "SecurePath",
      dateSubmitted: "2025-10-10",
      applicantName: "Divya Iyer",
      emailId: "divya.iyer@example.com",
      contactNumber: "+91-9988776655",
      currentCompany: "SafeNet",
      currentDesignation: "Security Analyst",
      totalYOE: 5,
      relevantYOE: 4,
      currentCTC: "14 LPA",
      expectedCTC: "17 LPA",
      noticePeriod: "30 days",
      location: "Kochi",
      readyToRelocate: true,
      comments: "CEH certified, SOC experience.",
      cvLink: "https://example.com/cv/divya-iyer.pdf",
      currentStatus: "DOCUMENT_VERIFIED"
    }
  ];

export interface InviteListFilters {
  searchText?: string;
  companyId?: string;
  sortOrder?: "ascending" | "descending";
  userType?: string;
}

export interface AgencyListApiResponse {
  data: AgencyApplicantsListDetailsDto[];
  pagination: PaginationInfo;
  totalReferrals?: number;
  currentPage?: number;
  totalPages?: number;
  matchingScore?: number;
}

export interface PaginationInfo {
  count: number;
  pageSize: number;
  sortOrder: string;
  timesQueried: number;
  queriedCount: number;
  lastKey: string;
}

const initialPaginationState: PaginationInfo = {
  count: 0,
  pageSize: 10,
  sortOrder: "descending",
  timesQueried: 0,
  queriedCount: 0,
  lastKey: "",
};

const ApplicantsList = () => {
  // const [searchBarText,setSearchBarText] = useState<string|null>("")
  // const [queryIsJobsLoading,setQueryIsJobsLoading] = useState<boolean>(false)
  // const [selectedRows, setSelectedRows] = useState<any[]>([]);
  // const [statusFilter, setStatusFilter] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [searchBarText,setSearchBarText] = useState<string|null>("")
    const [selectedRows, setSelectedRows] = useState<any[]>([]);
    const [pageSize,setPageSize] = useState<number>(10);
    const [filters, setFilters] = useState<InviteListFilters>({});
    const [isLoading,setIsLoading] = useState<boolean>(false);
    const [fetchData,setFetchData] = useState<any>(null);
    const [paginationInfo, setPaginationInfo] = useState(initialPaginationState);
    const [currentPage, setCurrentPage] = useState(1);
    const paginationKeysRef = useRef<Record<number, string>>({1: "",});
    const agencyBaseUrl = import.meta.env.APP_PROXY_AGENCY_BASE
    const { userDetails } = useAppContext();
    const [jobsList,setJobsList] = useState([]);

  const fetchApplicantsData = useCallback(
      async (
        page: number = 1,
        size: number = pageSize,
        lastKey: string = "",
        searchFilters = filters,
        isSearch = false,
        sortOrder = "desc"
      ) => {
  
        if (!userDetails?.email) return;
    
        setIsLoading(true);
        try {
        const url = `${agencyBaseUrl}/agency-user-submission/`;
        const params = {
          agencyRegisteredEmail: userDetails?.email,
          includeJobDetails: true,
          includeCandidateParsedCvDetails: true,
          // companyId: "", 
          // jobId: "",
          pageSize:size,
          lastKey,
          sortOrder,
        }
          const { response } = await httpServiceObj.get<AgencyListApiResponse>(url, true, params, true);
    
          if (response) {
            setFetchData(response.data);
            console.log(response)
            if (response.pagination) {
              setPaginationInfo(response.pagination);
    
              if (isSearch || page === 1) {
                paginationKeysRef.current = { 1: "" };
                if (response.pagination.lastKey) {
                  paginationKeysRef.current[2] = response.pagination.lastKey;
                }
              } else if (response.pagination.lastKey) {
                paginationKeysRef.current[page + 1] = response.pagination.lastKey;
              }
            }
          } else {
            console.error("Cannot fetch user details");
          }
        } catch (err) {
          console.error("Exception in fetchReferrals:", err);
        } finally {
          setIsLoading(false);
          // setFetchData(agencyDetailsList.data)
          // setPaginationInfo(agencyDetailsList.pagination)
        }
      },
      [userDetails, pageSize, filters]
    );

const StatusFilterDropdown = [
  { label: "All", onClick: () => { setStatusFilter("")}},
  { label: "Applied", onClick: () => { setStatusFilter("APPLIED")}},
  { label: "Accepted", onClick: () => { setStatusFilter("ACCEPTED")}},
  { label: "Under Evaluation", onClick: () => { setStatusFilter("UNDER_EVALUATION")} },
  { label: "Processing Interview", onClick: () => { setStatusFilter("PROCESSING_INTERVIEW")} },
  { label: "Interview Done", onClick: () => { setStatusFilter("INTERVIEW_DONE")}},
  { label: "Hiring In Process", onClick: () => { setStatusFilter("HIRING_IN_PROCESS")}},
  { label: "Hired", onClick: () => { setStatusFilter("HIRED")}},
  { label: "Joined", onClick: () => { setStatusFilter("JOINED")}},
  { label: "Rejected", onClick: () => { setStatusFilter("REJECTED")}},
];

  useEffect(() => {
    console.log(userDetails)
      if (userDetails?.email) {
        setCurrentPage(1);
        setPaginationInfo((prev) => ({ ...prev, lastKey: "" }));
        paginationKeysRef.current = { 1: "" };
        fetchApplicantsData(1, pageSize, "");
        // fetchJobs()
      }
    }, [userDetails, fetchApplicantsData, pageSize]);
  
  const searchInputRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchBarText(e.target.value);
  };

  const handlePageChange = useCallback((page: number) => {
      const lastKey = paginationKeysRef.current[page] || "";
      
      setCurrentPage(page);
      fetchApplicantsData(page, pageSize, lastKey);
    },
    [fetchApplicantsData, pageSize]
  );
    
    
  const handlePageSizeChange = useCallback(
    (size: number) => {
      setPageSize(size);
      setCurrentPage(1);
      setPaginationInfo((prev) => ({ ...prev, lastKey: "" }));
      paginationKeysRef.current = { 1: "" };
      fetchApplicantsData(1, size, "");
    },
    [fetchApplicantsData]
  );
      
  const removeAgencyLocally = (id: string) => {
    setFetchData((prev:any) => prev?.filter((item:any) => item.id !== id));
  };

  const toggleRow = (row: any) => {
    setSelectedRows((prev) =>
      prev.some((r) => r.id === row.id)
        ? prev.filter((r) => r.id !== row.id)
        : [...prev, row]
    );
  };

  const toggleSelectAll = (rows: any[]) => {
    if (selectedRows.length === rows.length) setSelectedRows([]);
    else setSelectedRows(rows);
  };

  const getAllSelected = (rows: any[]) => selectedRows.length === rows.length;
  const reset = () => setSelectedRows([]);
  
  const refetch = () => {};
  const handleJobApplicationStatusUpdate = () => {};
  const handleSendToRecruiter = () => {};
  const onBulkUpdate = () => {};

  const ListSelection = {
  selectedRows,
  toggleSelectAll,
  toggleRow,
  getAllSelected,
  reset,
  };

  const handleLocalUpdate = useCallback((jobId: string, updatedData: any) => {
    setFetchData((prevData:any) => {
    if (!prevData || !Array.isArray(prevData)) return prevData;

    return prevData.map(job =>
      job.id === jobId ? { ...job, ...updatedData } : job
    );
  });
  }, []);

  return (
    <div>
    <div className='flex flex-row gap-2 justify-center items-center m-2'>
            {/* Dropdown 1 */}
              <div className="flex gap-3 font-semibold w-full sm:w-auto">
                <GenericDropdownAgency
                  selectTitle={"Select company"}
                  tooltipMessage="Select company"
                  disabled={false}
                  options={StatusFilterDropdown}
                />
              </div>
    </div>
      <br />
      {isLoading ? (
              <SkeletonLoader
                  showTableHeader={true}
                  showTableRows={true}
                  tableColumns={5}
                  rowCount={5}
              />
              ) : (
              <ApplicantsListTable
                data={fetchData}
                userType="AGENCY"
                refetch={refetch}
                ListSelection={ListSelection}
                handleUpdate={handleJobApplicationStatusUpdate}
                sendApplicationToRecruiter={handleSendToRecruiter}
                isBulkEvaluation={!!selectedRows.length}
                onBulkUpdate={onBulkUpdate}
                localUpdate={handleLocalUpdate}
                removeAgencyLocally={removeAgencyLocally}
                pagination={paginationInfo}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                jobsList={jobsList}
              />
      )}
    </div>
  )
}

export default ApplicantsList
