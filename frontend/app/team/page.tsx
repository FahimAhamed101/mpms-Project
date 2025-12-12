'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/lib/store';
import ProtectedRoute from '@/app/components/auth/ProtectedRoute';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import { 
  useGetTeamMembersQuery,
  useUpdateTeamMemberMutation,
  useDeleteTeamMemberMutation 
} from '@/app/lib/api/teamApi';
import { useGetProjectsQuery } from '@/app/lib/api/projectApi';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  User,
  Mail,
  Shield,
  Building,
  Briefcase,
  CheckCircle,
  XCircle,
  Send,
  Download,
  Users,
  ChevronDown,
  Grid,
  List,
  Key,
  UserPlus,
  RefreshCw,
  BarChart,
} from 'lucide-react';
import { UserRole } from '@/app/types';

export default function TeamPage() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);

  // Fetch team members
  const { data: teamData, isLoading, refetch } = useGetTeamMembersQuery();
  const { data: projectsData } = useGetProjectsQuery();
  const [updateTeamMember] = useUpdateTeamMemberMutation();
  const [deleteTeamMember] = useDeleteTeamMemberMutation();

  const members = teamData?.data || [];
  const projects = projectsData?.data || [];

  // Filter members
  const filteredMembers = members.filter((member: any) => {
    if (searchTerm && !member.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !member.email.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !member.department?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (roleFilter !== 'all' && member.role !== roleFilter) return false;
    if (departmentFilter !== 'all' && member.department !== departmentFilter) return false;
    if (statusFilter === 'active' && !member.isActive) return false;
    if (statusFilter === 'inactive' && member.isActive) return false;
    return true;
  });

  // Get unique departments
  const departments = Array.from(new Set(
    members
      .map((m: any) => m.department)
      .filter(Boolean)
  ));

  // Get role info
  const getRoleInfo = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return {
          icon: Shield,
          color: 'text-red-600 bg-red-50',
          badgeColor: 'bg-red-100 text-red-800',
          description: 'Full system access',
        };
      case UserRole.MANAGER:
        return {
          icon: Briefcase,
          color: 'text-blue-600 bg-blue-50',
          badgeColor: 'bg-blue-100 text-blue-800',
          description: 'Can manage projects and teams',
        };
      case UserRole.MEMBER:
        return {
          icon: User,
          color: 'text-green-600 bg-green-50',
          badgeColor: 'bg-green-100 text-green-800',
          description: 'Can work on assigned tasks',
        };
      default:
        return {
          icon: User,
          color: 'text-gray-600 bg-gray-50',
          badgeColor: 'bg-gray-100 text-gray-800',
          description: '',
        };
    }
  };

  // Calculate team stats
  const calculateStats = () => {
    const total = members.length;
    const active = members.filter((m: any) => m.isActive).length;
    const admins = members.filter((m: any) => m.role === UserRole.ADMIN).length;
    const managers = members.filter((m: any) => m.role === UserRole.MANAGER).length;
    const membersCount = members.filter((m: any) => m.role === UserRole.MEMBER).length;
    
    return { total, active, admins, managers, membersCount };
  };

  const stats = calculateStats();

  // Handle member status toggle
  const handleToggleStatus = async (member: any) => {
    try {
      await updateTeamMember({
        id: member._id,
        isActive: !member.isActive,
      }).unwrap();
      refetch();
    } catch (error) {
      console.error('Failed to update member status:', error);
    }
  };

  // Handle role change
  const handleRoleChange = async (memberId: string, newRole: UserRole) => {
    try {
      await updateTeamMember({
        id: memberId,
        role: newRole,
      }).unwrap();
      refetch();
    } catch (error) {
      console.error('Failed to update member role:', error);
    }
  };

  // Handle member deletion
  const handleDeleteMember = async () => {
    if (!selectedMember) return;
    
    try {
      await deleteTeamMember(selectedMember._id).unwrap();
      setShowDeleteModal(false);
      setSelectedMember(null);
      refetch();
    } catch (error) {
      console.error('Failed to delete member:', error);
    }
  };

  // Handle reset password
  const handleResetPassword = async () => {
    if (!selectedMember) return;
    
    try {
      // Here you would call an API to reset password
      // For now, we'll just show an alert
      alert(`Password reset email sent to ${selectedMember.email}`);
      setShowResetPasswordModal(false);
      setSelectedMember(null);
    } catch (error) {
      console.error('Failed to reset password:', error);
    }
  };

  // Handle invite
  const handleInvite = async (email: string, role: UserRole) => {
    try {
      // Here you would call an API to send invitation
      // For now, we'll just show an alert
      alert(`Invitation sent to ${email} as ${role}`);
      setShowInviteModal(false);
    } catch (error) {
      console.error('Failed to send invitation:', error);
    }
  };

  return (
    <ProtectedRoute requiredRole={['admin', 'manager'].includes(user?.role || '') ? user?.role : 'admin'}>
      <DashboardLayout user={user}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
              <p className="text-gray-600 mt-1">
                Manage team members, roles, and permissions
              </p>
            </div>
            
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <button
                onClick={() => refetch()}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
              
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Member
              </button>
              
              <button
                onClick={() => router.push('/team/create')}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center mr-3">
                  <Users className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Members</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center mr-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center mr-3">
                  <Shield className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Admins</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.admins}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center mr-3">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Managers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.managers}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center mr-3">
                  <User className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Members</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.membersCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search team members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-8 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Roles</option>
                  {Object.values(UserRole).map((role) => (
                    <option key={role} value={role} className="capitalize">
                      {role}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              
              <div className="relative">
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-8 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Departments</option>
                  {departments.map((dept: string) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-8 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : 'bg-white'}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : 'bg-white'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Team Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-gray-200"></div>
                    <div className="ml-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No team members found</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                {searchTerm || roleFilter !== 'all' || departmentFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your filters or search terms'
                  : 'Get started by adding your first team member'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => router.push('/team/create')}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Team Member
                </button>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite via Email
                </button>
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            // Grid View
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMembers.map((member: any) => {
                const RoleIcon = getRoleInfo(member.role).icon;
                const roleColor = getRoleInfo(member.role).badgeColor;
                const roleDescription = getRoleInfo(member.role).description;
                
                return (
                  <div
                    key={member._id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300 overflow-hidden group"
                  >
                    <div className="p-6">
                      {/* Member Header */}
                      <div className="flex items-start mb-4">
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-lg font-bold text-indigo-600">
                              {member.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-bold text-gray-900 group-hover:text-indigo-600">
                                {member.name}
                              </h3>
                              <p className="text-sm text-gray-500">{member.email}</p>
                            </div>
                            <div className="relative">
                              <button
                                onClick={() => setSelectedMember(member)}
                                className="p-1 hover:bg-gray-100 rounded"
                              >
                                <MoreVertical className="h-5 w-5 text-gray-400" />
                              </button>
                              
                              {/* Dropdown Menu */}
                              {selectedMember?._id === member._id && (
                                <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                  <button
                                    onClick={() => {
                                      router.push(`/team/${member._id}`);
                                      setSelectedMember(null);
                                    }}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Profile
                                  </button>
                                  <button
                                    onClick={() => {
                                      router.push(`/team/${member._id}/edit`);
                                      setSelectedMember(null);
                                    }}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Member
                                  </button>
                                  {user?.role === UserRole.ADMIN && (
                                    <button
                                      onClick={() => {
                                        setSelectedMember(member);
                                        setShowResetPasswordModal(true);
                                      }}
                                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      <Key className="h-4 w-4 mr-2" />
                                      Reset Password
                                    </button>
                                  )}
                                  {user?.role === UserRole.ADMIN && user?._id !== member._id && (
                                    <button
                                      onClick={() => {
                                        setSelectedMember(member);
                                        setShowDeleteModal(true);
                                      }}
                                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Remove Member
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Role and Status */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${roleColor}`}>
                            <RoleIcon className="h-3 w-3 mr-1" />
                            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                          </span>
                        </div>
                        <button
                          onClick={() => handleToggleStatus(member)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            member.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {member.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </div>
                      
                      {/* Department */}
                      {member.department && (
                        <div className="flex items-center mb-4 text-sm text-gray-600">
                          <Building className="h-4 w-4 mr-2" />
                          <span>{member.department}</span>
                        </div>
                      )}
                      
                      {/* Skills */}
                      {member.skills && member.skills.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs text-gray-500 mb-2">Skills</p>
                          <div className="flex flex-wrap gap-1">
                            {member.skills.slice(0, 3).map((skill: string) => (
                              <span
                                key={skill}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                              >
                                {skill}
                              </span>
                            ))}
                            {member.skills.length > 3 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-600">
                                +{member.skills.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="text-center">
                          <div className="font-bold text-gray-900">
                            {member.stats?.projectCount || 0}
                          </div>
                          <div className="text-xs text-gray-500">Projects</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-gray-900">
                            {member.stats?.totalTasks || 0}
                          </div>
                          <div className="text-xs text-gray-500">Tasks</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-gray-900">
                            {member.stats?.activeTasks || 0}
                          </div>
                          <div className="text-xs text-gray-500">Active</div>
                        </div>
                      </div>
                      
                      {/* Role Change (Admin only) */}
                      {user?.role === UserRole.ADMIN && user?._id !== member._id && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <label className="block text-xs text-gray-500 mb-2">Change Role</label>
                          <select
                            value={member.role}
                            onChange={(e) => handleRoleChange(member._id, e.target.value as UserRole)}
                            className="w-full text-xs border border-gray-300 rounded-lg px-2 py-1 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            {Object.values(UserRole).map((role) => (
                              <option key={role} value={role} className="capitalize">
                                {role}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                    
                    {/* Footer */}
                    <div className="px-6 pb-6">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                          Joined {new Date(member.createdAt).toLocaleDateString()}
                        </p>
                        
                        <button
                          onClick={() => router.push(`/team/${member._id}`)}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                        >
                          View Profile →
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // List View
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Projects
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMembers.map((member: any) => {
                    const RoleIcon = getRoleInfo(member.role).icon;
                    const roleColor = getRoleInfo(member.role).badgeColor;
                    
                    return (
                      <tr key={member._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-sm font-bold text-indigo-600">
                                {member.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="font-medium text-gray-900">{member.name}</div>
                              <div className="text-sm text-gray-500">{member.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <RoleIcon className={`h-4 w-4 mr-2 ${getRoleInfo(member.role).color}`} />
                            <span className="text-sm text-gray-900 capitalize">
                              {member.role}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{member.department || '-'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleStatus(member)}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              member.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {member.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {member.stats?.projectCount || 0} projects
                          </div>
                          <div className="text-xs text-gray-500">
                            {member.stats?.activeTasks || 0} active tasks
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => router.push(`/team/${member._id}`)}
                              className="p-1 hover:bg-gray-100 rounded"
                              title="View"
                            >
                              <Eye className="h-4 w-4 text-gray-400" />
                            </button>
                            <button
                              onClick={() => router.push(`/team/${member._id}/edit`)}
                              className="p-1 hover:bg-gray-100 rounded"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4 text-gray-400" />
                            </button>
                            {user?.role === UserRole.ADMIN && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedMember(member);
                                    setShowResetPasswordModal(true);
                                  }}
                                  className="p-1 hover:bg-gray-100 rounded"
                                  title="Reset Password"
                                >
                                  <Key className="h-4 w-4 text-gray-400" />
                                </button>
                                {user?._id !== member._id && (
                                  <button
                                    onClick={() => {
                                      setSelectedMember(member);
                                      setShowDeleteModal(true);
                                    }}
                                    className="p-1 hover:bg-red-50 rounded"
                                    title="Remove"
                                  >
                                    <Trash2 className="h-4 w-4 text-red-400" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {filteredMembers.length > 0 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to{' '}
                <span className="font-medium">{Math.min(filteredMembers.length, 10)}</span> of{' '}
                <span className="font-medium">{filteredMembers.length}</span> results
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50">
                  Previous
                </button>
                <button className="px-3 py-1 border border-gray-300 bg-gray-50 rounded text-sm font-medium">
                  1
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50">
                  2
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50">
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Remove Team Member</h3>
                  <p className="text-sm text-gray-600">
                    Are you sure you want to remove this team member?
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    Note: This will deactivate their account but preserve their data.
                  </p>
                </div>
              </div>
              
              {selectedMember && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                      <span className="text-sm font-bold text-indigo-600">
                        {selectedMember.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{selectedMember.name}</p>
                      <p className="text-sm text-gray-600">{selectedMember.email}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedMember(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteMember}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                >
                  Remove Member
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
              <div className="flex items-center mb-6">
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                  <UserPlus className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Invite Team Member</h3>
                  <p className="text-sm text-gray-600">
                    Send an invitation email to join your team
                  </p>
                </div>
              </div>
              
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const email = formData.get('email') as string;
                  const role = formData.get('role') as UserRole;
                  handleInvite(email, role);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="colleague@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role *
                  </label>
                  <select
                    name="role"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    defaultValue={UserRole.MEMBER}
                  >
                    {Object.values(UserRole).map((role) => (
                      <option key={role} value={role} className="capitalize">
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department (Optional)
                  </label>
                  <input
                    type="text"
                    name="department"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Engineering, Design, etc."
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="sendCredentials"
                    id="sendCredentials"
                    defaultChecked
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="sendCredentials" className="ml-2 text-sm text-gray-700">
                    Send login credentials via email
                  </label>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Invitation
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reset Password Modal */}
        {showResetPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
              <div className="flex items-center mb-6">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <Key className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Reset Password</h3>
                  <p className="text-sm text-gray-600">
                    Reset password for team member
                  </p>
                </div>
              </div>
              
              {selectedMember && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                      <span className="text-sm font-bold text-indigo-600">
                        {selectedMember.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{selectedMember.name}</p>
                      <p className="text-sm text-gray-600">{selectedMember.email}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password (Optional)
                  </label>
                  <input
                    type="password"
                    placeholder="Leave blank for auto-generated"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    If left blank, a random password will be generated and emailed.
                  </p>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="forcePasswordChange"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    defaultChecked
                  />
                  <label htmlFor="forcePasswordChange" className="ml-2 text-sm text-gray-700">
                    Require password change on first login
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowResetPasswordModal(false);
                    setSelectedMember(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetPassword}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Reset Password
                </button>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}