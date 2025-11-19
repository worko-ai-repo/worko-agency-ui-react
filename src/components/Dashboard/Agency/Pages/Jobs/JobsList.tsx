import SearchBar from '@Components/Shared/SearchBar'
import SkeletonLoader from '@Components/Shared/SkeletonLoader'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import GenericDropdownAgency from '@Components/Shared/DropDown/GenericDropdownAgency'
import SearchBarAgency from '@Components/Shared/SearchBarAgency'
import JobsListTable from './JobsListTable'
import httpServiceObj from '@Services/ApiHandler.service'
import { useAppContext } from '@Context/App.context';
import { AgencyJobsList } from '@Interfaces/AgencyDashboardList.dto'

// const dummyData = [
//   {
//     id: "ref-01",
//     pk: "REFERRAL#ref-01",
//     sk: "CANDIDATE#ref-01",
//     companyName: "TechHire Solutions",
//     profile: "Cloud Engineer",
//     YOEStart: 2,
//     YOEEnd: 5,
//     salaryStart: 3,
//     salaryEnd: 6,
//     noticePeriod: 60,
//     dateAssigned: "10-10-2025",
//     candidatesUploaded: 10,
//     candidatesRejected: 20,
//     candidatesInProcess: 30,
//   },
//   {
//     id: "ref-02",
//     pk: "REFERRAL#ref-02",
//     sk: "CANDIDATE#ref-02",
//     companyName: "InnoTech Systems",
//     profile: "Frontend Developer",
//     YOEStart: 1,
//     YOEEnd: 3,
//     salaryStart: 4,
//     salaryEnd: 7,
//     noticePeriod: 30,
//     dateAssigned: "11-10-2025",
//     candidatesUploaded: 8,
//     candidatesRejected: 5,
//     candidatesInProcess: 12,
//   },
//   {
//     id: "ref-03",
//     pk: "REFERRAL#ref-03",
//     sk: "CANDIDATE#ref-03",
//     companyName: "CloudNova",
//     profile: "DevOps Engineer",
//     YOEStart: 3,
//     YOEEnd: 6,
//     salaryStart: 5,
//     salaryEnd: 9,
//     noticePeriod: 45,
//     dateAssigned: "09-10-2025",
//     candidatesUploaded: 12,
//     candidatesRejected: 4,
//     candidatesInProcess: 9,
//   },
//   {
//     id: "ref-04",
//     pk: "REFERRAL#ref-04",
//     sk: "CANDIDATE#ref-04",
//     companyName: "DataMinds Inc.",
//     profile: "Data Analyst",
//     YOEStart: 2,
//     YOEEnd: 4,
//     salaryStart: 3,
//     salaryEnd: 5,
//     noticePeriod: 15,
//     dateAssigned: "08-10-2025",
//     candidatesUploaded: 5,
//     candidatesRejected: 2,
//     candidatesInProcess: 6,
//   },
//   {
//     id: "ref-05",
//     pk: "REFERRAL#ref-05",
//     sk: "CANDIDATE#ref-05",
//     companyName: "CyberBridge Corp",
//     profile: "Cybersecurity Engineer",
//     YOEStart: 4,
//     YOEEnd: 7,
//     salaryStart: 6,
//     salaryEnd: 10,
//     noticePeriod: 90,
//     dateAssigned: "07-10-2025",
//     candidatesUploaded: 7,
//     candidatesRejected: 3,
//     candidatesInProcess: 8,
//   },
//   {
//     id: "ref-06",
//     pk: "REFERRAL#ref-06",
//     sk: "CANDIDATE#ref-06",
//     companyName: "QuantumStack",
//     profile: "Backend Developer",
//     YOEStart: 1,
//     YOEEnd: 2,
//     salaryStart: 2,
//     salaryEnd: 4,
//     noticePeriod: 30,
//     dateAssigned: "06-10-2025",
//     candidatesUploaded: 6,
//     candidatesRejected: 1,
//     candidatesInProcess: 5,
//   },
//   {
//     id: "ref-07",
//     pk: "REFERRAL#ref-07",
//     sk: "CANDIDATE#ref-07",
//     companyName: "NeuralEdge AI",
//     profile: "Machine Learning Engineer",
//     YOEStart: 3,
//     YOEEnd: 6,
//     salaryStart: 7,
//     salaryEnd: 12,
//     noticePeriod: 60,
//     dateAssigned: "05-10-2025",
//     candidatesUploaded: 9,
//     candidatesRejected: 6,
//     candidatesInProcess: 11,
//   },
//   {
//     id: "ref-08",
//     pk: "REFERRAL#ref-08",
//     sk: "CANDIDATE#ref-08",
//     companyName: "NextGen Web",
//     profile: "UI/UX Designer",
//     YOEStart: 2,
//     YOEEnd: 4,
//     salaryStart: 3,
//     salaryEnd: 6,
//     noticePeriod: 30,
//     dateAssigned: "04-10-2025",
//     candidatesUploaded: 4,
//     candidatesRejected: 2,
//     candidatesInProcess: 3,
//   },
//   {
//     id: "ref-09",
//     pk: "REFERRAL#ref-09",
//     sk: "CANDIDATE#ref-09",
//     companyName: "SecureTech",
//     profile: "Security Analyst",
//     YOEStart: 5,
//     YOEEnd: 8,
//     salaryStart: 8,
//     salaryEnd: 13,
//     noticePeriod: 90,
//     dateAssigned: "03-10-2025",
//     candidatesUploaded: 11,
//     candidatesRejected: 7,
//     candidatesInProcess: 14,
//   },
//   {
//     id: "ref-10",
//     pk: "REFERRAL#ref-10",
//     sk: "CANDIDATE#ref-10",
//     companyName: "AppDynamics Labs",
//     profile: "Mobile App Developer",
//     YOEStart: 1,
//     YOEEnd: 3,
//     salaryStart: 3,
//     salaryEnd: 5,
//     noticePeriod: 20,
//     dateAssigned: "02-10-2025",
//     candidatesUploaded: 3,
//     candidatesRejected: 1,
//     candidatesInProcess: 2,
//   },
// ];
export interface JobListFilters {
  searchText?: string;
  companyId?: string;
  sortOrder?: "ascending" | "descending";
  userType?: string;
}
export interface JobsListApiResponse {
  data: AgencyJobsList[];
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

const JobsList = () => {
  const [searchBarText,setSearchBarText] = useState<string|null>("");
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("");
  
  const [filters, setFilters] = useState<JobListFilters>({});
  const [pageSize,setPageSize] = useState<number>(10);
  const [isLoading,setIsLoading] = useState<boolean>(false);
  const [fetchData,setFetchData] = useState<any>(null);
  const [paginationInfo, setPaginationInfo] = useState(initialPaginationState);
  const [currentPage, setCurrentPage] = useState(1);
  const paginationKeysRef = useRef<Record<number, string>>({1: "",});
  const { userDetails } = useAppContext();
  const [jobsList,setJobsList] = useState([]);

  const agencyBaseUrl = import.meta.env.APP_PROXY_AGENCY_BASE

    // useEffect(() => {
    //   const params = {
    //     agencyRegisteredEmail: "rohithappala777+agencyinviteone@gmail.com",
    //     status: "ACTIVE",
    //     includeJobDetails: true
    //   }
    //   const fetchJobs = async()=>{
    //     try {
    //       const {response} = await httpServiceObj.get(`${agencyBaseUrl}/agency-job-assignment/`,true,params,true)
    //       console.log(response)
    //     } catch (error) {
    //       console.log(error)
    //     }
    //   }
    //   fetchJobs()
    // }, [])

    const fetchJobsData = useCallback(
      async (
        page: number = 1,
        size: number = pageSize,
        lastKey: string = "",
        searchFilters = filters,
        isSearch = false,
        sortOrder = "desc"
      ) => {
        //@TODO enable this later
        // if (!userDetails?.email) return;
    
        setIsLoading(true);
        try {
          const url = `${agencyBaseUrl}/agency-job-assignment/`;
          const params = {
            agencyRegisteredEmail: userDetails?.email,
            status: "ACTIVE",
            includeJobDetails: true,
            pageSize:size,
            lastKey,
            sortOrder,
          }
          const { response } = await httpServiceObj.get<JobsListApiResponse>(url, true, params, true);
    
          if (response) {
            setFetchData(response.data);
            // console.log(response)
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
          // setFetchData(dummyData.data)
          // setPaginationInfo(dummyData.pagination)
        }
      },
      [userDetails, pageSize, filters]
    );
  
    //   const fetchJobs = async() =>{
    //   const params = {
    //   agencyEmail: "rohithappala777+agencyinviteone@gmail.com",
    //   // inviteStatus: "AWAITING",
    //   includeCompanyDetails: true,
    //   includeInvitedOwnerDetails: true
    // }
  
    //   try {
    //     const {response} = await httpServiceObj.get<any>(`${agencyBaseUrl}/agency-invite/`,true,params,true)
    //     if(response?.data){
    //       setJobsList(response.data)
    //     }
    //   } catch (error) {
    //     console.log(error)
    //   }
    // }
  
    //@TODO remove this below useeffect later
    useEffect(()=>{
      fetchJobsData(1, pageSize, "");
    },[])

      useEffect(() => {
          if (userDetails?.email) {
            setCurrentPage(1);
            setPaginationInfo((prev) => ({ ...prev, lastKey: "" }));
            paginationKeysRef.current = { 1: "" };
            fetchJobsData(1, pageSize, "");
            // fetchJobs()
          }
        }, [userDetails, fetchJobsData, pageSize]);
      
          const searchInputRef = useRef<NodeJS.Timeout | null>(null);
        
          const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setSearchBarText(e.target.value);
          };
    
          const handlePageChange = useCallback((page: number) => {
              const lastKey = paginationKeysRef.current[page] || "";
              
              setCurrentPage(page);
              fetchJobsData(page, pageSize, lastKey);
            },
            [fetchJobsData, pageSize]
          );
        
        
          const handlePageSizeChange = useCallback(
            (size: number) => {
              setPageSize(size);
              setCurrentPage(1);
              setPaginationInfo((prev) => ({ ...prev, lastKey: "" }));
              paginationKeysRef.current = { 1: "" };
              fetchJobsData(1, size, "");
            },
            [fetchJobsData]
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

  return (
    <div>
      <div className='flex flex-row gap-2 justify-center items-center m-2'>
        {/* Dropdown 1 */}
          <div className="flex gap-3 font-semibold w-full sm:w-auto">
            <GenericDropdownAgency
              selectTitle={"Select Company"}
              tooltipMessage="Select Company to filter"
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
              <JobsListTable
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

export default JobsList
