import SearchBar from '@Components/Shared/SearchBar'
import SkeletonLoader from '@Components/Shared/SkeletonLoader'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import GenericDropdownAgency from '@Components/Shared/DropDown/GenericDropdownAgency'
import ApplicantsListTable from './ApplicantsListTable'
import { useAppContext } from '@Context/App.context'
import httpServiceObj from '@Services/ApiHandler.service'
import { AgencyApplicantsListDetailsDto } from '@Interfaces/AgencyDashboardList.dto'

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

    const CompanyFilterDropdown = [
      { label: "All", onClick: () => { setStatusFilter("") }},
      { label: "Nellsys", onClick: () => { setStatusFilter("Nellsys") }},
      { label: "Byjus", onClick: () => { setStatusFilter("Byjus") }},
      { label: "Flipkart", onClick: () => { setStatusFilter("Flipkart") }},
      { label: "Amazon", onClick: () => { setStatusFilter("Amazon") }},
      { label: "Google", onClick: () => { setStatusFilter("Google") }},
      { label: "Infosys", onClick: () => { setStatusFilter("Infosys") }},
      { label: "TCS", onClick: () => { setStatusFilter("TCS") }},
      { label: "Wipro", onClick: () => { setStatusFilter("Wipro") }},
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
                  selectTitle={"Select Company"}
                  tooltipMessage="Select Company"
                  disabled={false}
                  options={CompanyFilterDropdown}
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
