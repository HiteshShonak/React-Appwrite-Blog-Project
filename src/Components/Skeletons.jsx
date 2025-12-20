import { useSelector } from 'react-redux';
import { Container } from './index'; // Make sure this path points to your Container component

// 1. Generic Skeleton Box (Helper for small tweaks)
const SkeletonBox = ({ className }) => (
  <div className={`bg-slate-200 animate-pulse rounded ${className}`}></div>
);

// ==========================================
// 2. DASHBOARD SKELETON (From Dashboard.jsx)
// ==========================================
export const DashboardAuthSkeleton = () => {
  return (
    <div className='w-full min-h-screen bg-slate-50 py-6 sm:py-8 px-2 sm:px-4'>
        <Container>
            {/* Identity Section Skeleton */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-6 sm:mb-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 sm:gap-5 w-full md:w-auto animate-pulse">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-200 shrink-0"></div>
                        <div className="space-y-2 flex-1">
                            <div className="h-5 sm:h-6 w-32 sm:w-40 bg-slate-200 rounded"></div>
                            <div className="h-3 sm:h-4 w-48 sm:w-56 bg-slate-200 rounded"></div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-end animate-pulse">
                        <div className="h-8 sm:h-10 w-20 sm:w-24 bg-slate-200 rounded-lg"></div>
                        <div className="hidden md:block h-6 sm:h-8 w-px bg-slate-200"></div>
                        <div className="h-8 sm:h-10 w-16 sm:w-20 bg-slate-200 rounded-lg"></div>
                    </div>
                </div>
            </div>

            {/* Action Bar Skeleton */}
            <div className="flex items-end justify-between mb-4 sm:mb-6 animate-pulse">
                <div className="h-7 sm:h-8 w-24 sm:w-28 bg-slate-200 rounded"></div>
                <div className="h-9 sm:h-11 w-32 sm:w-40 bg-slate-200 rounded-xl"></div>
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-12">
                {[
                    { span: "" },
                    { span: "" },
                    { span: "col-span-2 md:col-span-1" }
                ].map((stat, index) => (
                    <div 
                        key={index} 
                        className={`bg-white p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 ${stat.span}`}
                    >
                        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 animate-pulse">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-slate-200 rounded-lg sm:rounded-xl shrink-0"></div>
                            <div className="space-y-2 flex-1">
                                <div className="h-3 sm:h-4 w-16 sm:w-20 bg-slate-200 rounded"></div>
                                <div className="h-6 sm:h-7 md:h-8 w-10 sm:w-12 bg-slate-200 rounded"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Section Header Skeleton */}
            <div className="mb-3 sm:mb-4 animate-pulse">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                    <div className="h-5 sm:h-6 w-36 sm:w-44 bg-slate-200 rounded"></div>
                </div>
            </div>

            {/* Post Cards Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {[...Array(8)].map((_, index) => (
                    <div key={index} className="bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                        <div className="aspect-video w-full bg-slate-200 animate-pulse"></div>
                        <div className="p-3 sm:p-4 space-y-3">
                            <div className="space-y-2 animate-pulse">
                                <div className="h-4 bg-slate-200 rounded w-full"></div>
                                <div className="h-4 bg-slate-200 rounded w-4/5"></div>
                            </div>
                            <div className="flex items-center gap-2 pt-1 animate-pulse">
                                <div className="h-3 bg-slate-200 rounded w-16"></div>
                                <div className="h-3 bg-slate-200 rounded w-20"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Container>
    </div>
  );
};

// ==========================================
// 3. POST SKELETON (From Post.jsx)
// ==========================================
export const PostSkeleton = () => {
    return (
        <div className="py-8 sm:py-12 bg-slate-50 min-h-screen px-2 sm:px-4">
            <Container>
                <article className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                    {/* Hero image skeleton */}
                    <div className="w-full aspect-video bg-slate-200 animate-pulse"></div>
                    
                    {/* Content skeleton */}
                    <div className="p-6 sm:p-8 md:p-12 pb-8 sm:pb-10">
                        {/* Title + Author section */}
                        <div className="mb-6 sm:mb-8 border-b border-slate-200 pb-4 sm:pb-6">
                            {/* Title skeleton */}
                            <div className="h-8 sm:h-10 md:h-12 bg-slate-200 rounded-lg w-4/5 mb-3 sm:mb-4 animate-pulse"></div>
                            
                            {/* Author info skeleton */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 animate-pulse">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    {/* Avatar circle */}
                                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-200 shrink-0"></div>
                                    <div className="flex flex-col gap-1.5">
                                        <div className="h-4 bg-slate-200 rounded w-32"></div>
                                        <div className="h-3 bg-slate-200 rounded w-24"></div>
                                    </div>
                                </div>
                                {/* Views skeleton */}
                                <div className="h-5 bg-slate-200 rounded w-24"></div>
                            </div>
                        </div>
                        
                        {/* Content lines skeleton */}
                        <div className="space-y-3 sm:space-y-4 animate-pulse">
                            <div className="h-4 bg-slate-200 rounded w-full"></div>
                            <div className="h-4 bg-slate-200 rounded w-full"></div>
                            <div className="h-4 bg-slate-200 rounded w-11/12"></div>
                            <div className="h-4 bg-slate-200 rounded w-full"></div>
                            <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                            <div className="h-4 bg-slate-200 rounded w-full"></div>
                            <div className="h-4 bg-slate-200 rounded w-10/12"></div>
                        </div>
                    </div>
                    
                    {/* Separator */}
                    <div className="border-t border-slate-200 mx-6 sm:mx-8 md:mx-12 mb-8 sm:mb-10"></div>
                    
                    {/* Rating + Comments skeleton */}
                    <div className="px-6 sm:px-8 md:px-12 pb-8 sm:pb-12">
                        <div className="max-w-3xl mx-auto space-y-8 sm:space-y-10">
                            {/* Rating section skeleton */}
                            <div className="h-16 bg-slate-200 rounded-xl w-full animate-pulse"></div>
                            
                            <div className="border-t border-slate-100"></div>
                            
                            {/* Comments section skeleton */}
                            <div className="space-y-4 animate-pulse">
                                <div className="h-6 bg-slate-200 rounded w-32"></div>
                                <div className="h-24 bg-slate-200 rounded-xl w-full"></div>
                            </div>
                        </div>
                    </div>
                </article>
            </Container>
        </div>
    );
};

// ==========================================
// 4. AUTHOR PROFILE SKELETON (From AuthorProfile.jsx)
// ==========================================
export const AuthorProfileSkeleton = () => {
    return (
        <div className='w-full min-h-screen bg-slate-50 py-8 sm:py-12 px-2 sm:px-4 animate-pulse'>
            <Container>
                {/* Profile card skeleton */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 mb-8 sm:mb-12">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-4 sm:gap-6">
                        {/* Avatar skeleton */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-200 shrink-0"></div>
                        
                        {/* Name & stats skeleton */}
                        <div className="flex-1 pt-2 w-full">
                            <div className="h-8 sm:h-9 bg-slate-200 rounded-lg w-48 mx-auto md:mx-0 mb-2"></div>
                            <div className="h-6 bg-slate-200 rounded w-32 mx-auto md:mx-0 mb-3 sm:mb-4"></div>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                <div className="h-5 bg-slate-200 rounded w-24"></div>
                                <div className="h-5 bg-slate-200 rounded w-32"></div>
                            </div>
                        </div>
                    </div>

                    <hr className="my-6 sm:my-8 border-slate-100" />

                    {/* Bio skeleton */}
                    <div>
                        <div className="h-6 bg-slate-200 rounded w-32 mb-3 mx-auto md:mx-0"></div>
                        <div className="space-y-2 max-w-3xl">
                            <div className="h-4 bg-slate-200 rounded w-full"></div>
                            <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                            <div className="h-4 bg-slate-200 rounded w-4/6"></div>
                        </div>
                    </div>
                </div>

                {/* Posts grid skeleton */}
                <div className="flex items-center gap-3 mb-6 sm:mb-8 px-2">
                    <div className="h-6 sm:h-8 w-1.5 bg-slate-200 rounded-full"></div>
                    <div className="h-7 sm:h-8 bg-slate-200 rounded w-40"></div>
                </div>
                
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'>
                    {[...Array(4)].map((_, index) => (
                        <div key={index} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                            <div className="h-40 sm:h-48 bg-slate-200"></div>
                            <div className="p-4 space-y-3">
                                <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                                <div className="h-4 bg-slate-200 rounded w-full"></div>
                                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </Container>
        </div>
    );
};

// ==========================================
// 5. ALL POSTS SKELETON (From AllPosts.jsx)
// ==========================================
export const AllPostsSkeleton = () => {
    return (
        <div className='py-6 sm:py-8 bg-slate-50 min-h-screen animate-pulse px-2 sm:px-4'>
            <Container>
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 border-b border-slate-200 pb-3 sm:pb-4">
                    <div className="h-8 w-48 bg-slate-200 rounded-lg"></div>
                    <div className="h-6 w-24 bg-slate-200 rounded-full mt-2 sm:mt-0"></div>
                </div>

                <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6'>
                    {[...Array(10)].map((_, index) => (
                        <div key={index} className="bg-white rounded-xl overflow-hidden h-full border border-slate-100 shadow-sm">
                            <div className="aspect-video w-full bg-slate-200"></div>
                            <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                                <div className="space-y-2">
                                    <div className="h-4 bg-slate-200 rounded w-full"></div>
                                    <div className="h-4 bg-slate-200 rounded w-4/5"></div>
                                </div>
                                <div className="flex items-center gap-2 pt-1">
                                    <div className="h-3 bg-slate-200 rounded w-16"></div>
                                    <div className="h-3 bg-slate-200 rounded w-20"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Container>
        </div>
    );
};

// ==========================================
// 6. ABOUT US SKELETON
// ==========================================
export const AboutUsSkeleton = () => {
    return (
        <div className='w-full min-h-screen bg-slate-50 py-12 md:py-20 px-2 sm:px-4 animate-pulse'>
            <Container>
                <div className="max-w-4xl mx-auto">
                    
                    {/* Hero section */}
                    <div className="text-center mb-16">
                        <div className="inline-block w-16 h-16 bg-slate-200 rounded-2xl mb-6"></div>
                        <div className="h-10 md:h-14 bg-slate-200 rounded-lg w-3/4 mx-auto mb-6"></div>
                        <div className="space-y-3 max-w-2xl mx-auto">
                            <div className="h-4 md:h-5 bg-slate-200 rounded w-full"></div>
                            <div className="h-4 md:h-5 bg-slate-200 rounded w-5/6 mx-auto"></div>
                        </div>
                    </div>

                    {/* Mission card */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12 mb-12">
                        <div className="flex flex-col md:flex-row items-center gap-10">
                            <div className="flex-1 w-full space-y-4">
                                <div className="h-8 bg-slate-200 rounded w-1/3 mb-6"></div>
                                <div className="space-y-3">
                                    <div className="h-4 bg-slate-200 rounded w-full"></div>
                                    <div className="h-4 bg-slate-200 rounded w-11/12"></div>
                                    <div className="h-4 bg-slate-200 rounded w-full"></div>
                                    <div className="h-4 bg-slate-200 rounded w-4/5"></div>
                                </div>
                            </div>
                            <div className="flex-1 w-full">
                                <div className="w-full h-64 bg-slate-200 rounded-2xl"></div>
                            </div>
                        </div>
                    </div>

                    {/* Values grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-full">
                                <div className="w-12 h-12 bg-slate-200 rounded-xl mb-4"></div>
                                <div className="h-6 bg-slate-200 rounded w-1/2 mb-3"></div>
                                <div className="space-y-2">
                                    <div className="h-3 bg-slate-200 rounded w-full"></div>
                                    <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                                    <div className="h-3 bg-slate-200 rounded w-4/6"></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* CTA section */}
                    <div className="bg-slate-200 rounded-3xl p-8 md:p-12 h-80 w-full relative overflow-hidden flex flex-col items-center justify-center">
                        <div className="h-8 bg-slate-300 rounded w-1/2 mb-4"></div>
                        <div className="h-4 bg-slate-300 rounded w-2/3 mb-8"></div>
                        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                            <div className="h-12 bg-slate-300 rounded-xl w-40"></div>
                            <div className="h-12 bg-slate-300 rounded-xl w-40"></div>
                        </div>
                    </div>

                </div>
            </Container>
        </div>
    );
};

// ==========================================
// 7. CONTACT SKELETON
// ==========================================
export const ContactSkeleton = () => {
    return (
        <div className='w-full min-h-screen bg-slate-50 py-12 px-2 sm:px-4 animate-pulse'>
            <Container>
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-10 items-start">
                    
                    {/* Left Info Skeleton */}
                    <div className="w-full md:w-1/3 pt-4 space-y-6">
                        <div>
                            {/* Title h2 */}
                            <div className="h-9 bg-slate-200 rounded w-3/4 mb-2"></div>
                            {/* Subtitle p */}
                            <div className="h-4 bg-slate-200 rounded w-full"></div>
                        </div>
                        
                        <div className="flex items-start gap-4">
                            {/* Icon Box */}
                            <div className="w-12 h-12 bg-slate-200 rounded-xl shrink-0"></div>
                            {/* Email Text */}
                            <div className="space-y-2 pt-1">
                                <div className="h-5 bg-slate-200 rounded w-24"></div>
                                <div className="h-4 bg-slate-200 rounded w-48"></div>
                            </div>
                        </div>
                    </div>

                    {/* Right Form Skeleton */}
                    <div className="w-full md:w-2/3 bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                        <div className="space-y-6">
                            {/* Name & Email Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <div className="h-4 bg-slate-200 rounded w-16"></div>
                                    <div className="h-10 bg-slate-200 rounded-lg w-full"></div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-slate-200 rounded w-16"></div>
                                    <div className="h-10 bg-slate-200 rounded-lg w-full"></div>
                                </div>
                            </div>

                            {/* Subject */}
                            <div className="space-y-2">
                                <div className="h-4 bg-slate-200 rounded w-20"></div>
                                <div className="h-10 bg-slate-200 rounded-lg w-full"></div>
                            </div>

                            {/* Message Textarea */}
                            <div className="space-y-2">
                                <div className="h-4 bg-slate-200 rounded w-20"></div>
                                <div className="h-32 bg-slate-200 rounded-lg w-full"></div>
                            </div>

                            {/* Submit Button */}
                            <div className="h-12 bg-slate-200 rounded-lg w-full shadow-md"></div>
                        </div>
                    </div>

                </div>
            </Container>
        </div>
    );
};

// ==========================================
// 8. FAQ SKELETON
// ==========================================
export const FaqSkeleton = () => {
    return (
        <div className='w-full min-h-screen bg-slate-50 py-16 px-2 sm:px-4 animate-pulse'>
            <Container>
                <div className="max-w-4xl mx-auto">
                    
                    {/* Page header */}
                    <div className="text-center mb-12">
                        <div className="h-10 sm:h-14 bg-slate-200 rounded-lg w-3/4 sm:w-1/2 mx-auto mb-4"></div>
                        <div className="h-4 sm:h-5 bg-slate-200 rounded w-2/3 sm:w-1/3 mx-auto"></div>
                    </div>

                    {/* FAQ sections container */}
                    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-12 space-y-8">
                        {/* Simulate 3 Categories */}
                        {[1, 2, 3].map((section) => (
                            <div key={section} className={section > 1 ? "pt-8 border-t border-slate-100" : ""}>
                                {/* Category Title + Icon */}
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-6 h-6 bg-slate-200 rounded-md shrink-0"></div>
                                    <div className="h-8 bg-slate-200 rounded w-1/3"></div>
                                </div>

                                {/* Questions List */}
                                <div className="space-y-6">
                                    {[1, 2, 3].map((item) => (
                                        <div key={item} className="flex justify-between items-center py-2 border-b border-slate-50 pb-4">
                                            <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                                            <div className="w-6 h-6 bg-slate-200 rounded-full shrink-0"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Contact support CTA */}
                    <div className="mt-12 text-center bg-indigo-50 p-8 rounded-2xl border border-indigo-200">
                        <div className="h-6 bg-indigo-200 rounded w-1/3 mx-auto mb-4"></div>
                        <div className="h-4 bg-indigo-200 rounded w-1/2 mx-auto mb-6"></div>
                        <div className="h-12 bg-indigo-300 rounded-xl w-40 mx-auto"></div>
                    </div>

                </div>
            </Container>
        </div>
    );
};

// ==========================================
// 9. LOGIN SKELETON (Exact Nested Match)
// ==========================================
export const LoginSkeleton = () => {
  return (
    // ✅ Matches Login.jsx wrapper exactly (relative pt-20)
    <div className='relative pt-30 w-full min-h-screen pb-20'>
      <div className='max-w-md mx-auto p-6 border border-gray-200 rounded-lg shadow-lg bg-white'>
        
        {/* Header Section */}
        <div className="mb-6 flex flex-col items-center space-y-2">
          {/* Title "Login to Your Account" */}
          <div className="h-8 w-64 bg-slate-200 rounded-md animate-pulse"></div>
          {/* Subtitle "Welcome back..." */}
          <div className="h-4 w-48 bg-slate-200 rounded-md animate-pulse"></div>
        </div>

        {/* Form Fields */}
        <div className='space-y-5'>
          {/* Email Field */}
          <div>
            {/* Label */}
            <div className="h-4 w-12 bg-slate-200 rounded animate-pulse mb-1.5 ml-1"></div>
            {/* Input Box */}
            <div className="h-11 w-full bg-slate-200 rounded-lg animate-pulse"></div>
          </div>

          {/* Password Field */}
          <div>
            {/* Label (matches mb-1.5 pl-1 spacing) */}
            <div className="h-4 w-20 bg-slate-200 rounded animate-pulse mb-1.5 ml-1"></div>
            {/* Input Box */}
            <div className="h-11 w-full bg-slate-200 rounded-lg animate-pulse"></div>
          </div>

          {/* Login Button (h-12 matches button height) */}
          <div className="pt-2">
            <div className="h-12 w-full bg-slate-300 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Footer Link Section */}
        <div className='mt-6 flex justify-center'>
          <div className="h-4 w-48 bg-slate-200 rounded animate-pulse"></div>
        </div>

      </div>
    </div>
  );
};

// ==========================================
// 10. SIGNUP SKELETON (Exact Match)
// ==========================================
export const SignupSkeleton = () => {
  return (
    // 🔒 FIXED: Matches Signup.jsx outer wrapper exactly
    <div className='relative pt-20 pb-20 w-full min-h-screen'>
      <div className='max-w-md mx-auto p-6 border border-gray-200 rounded-lg shadow-lg bg-white'>
        
        {/* Header */}
        <div className="mb-6 flex flex-col items-center space-y-2">
          <div className="h-8 w-64 bg-slate-200 rounded-md animate-pulse"></div>
          <div className="h-4 w-40 bg-slate-200 rounded-md animate-pulse"></div>
        </div>

        {/* Form Fields */}
        <div className='space-y-5'>
          {/* Full Name */}
          <div>
            <div className="h-4 w-20 bg-slate-200 rounded animate-pulse mb-2 ml-1"></div>
            <div className="h-11 w-full bg-slate-200 rounded-lg animate-pulse"></div>
          </div>

          {/* Username */}
          <div>
            <div className="h-4 w-20 bg-slate-200 rounded animate-pulse mb-2 ml-1"></div>
            <div className="h-11 w-full bg-slate-200 rounded-lg animate-pulse"></div>
            <div className="h-3 w-48 bg-slate-100 rounded animate-pulse mt-2 ml-1"></div>
          </div>

          {/* Email */}
          <div>
            <div className="h-4 w-16 bg-slate-200 rounded animate-pulse mb-2 ml-1"></div>
            <div className="h-11 w-full bg-slate-200 rounded-lg animate-pulse"></div>
          </div>

          {/* Password */}
          <div>
            <div className="h-4 w-20 bg-slate-200 rounded animate-pulse mb-2 ml-1"></div>
            <div className="h-11 w-full bg-slate-200 rounded-lg animate-pulse"></div>
            <div className="h-3 w-56 bg-slate-100 rounded animate-pulse mt-2 ml-1"></div>
          </div>

          {/* Button */}
          <div className="pt-2">
            <div className="h-12 w-full bg-slate-300 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Footer */}
        <div className='mt-6 flex justify-center'>
          <div className="h-4 w-56 bg-slate-200 rounded animate-pulse"></div>
        </div>

      </div>
    </div>
  );
};

// ==========================================
// 11. CUSTOM EDITOR LOADER (Exact Match from PostForm)
// ==========================================
export const EditorLoader = () => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md transition-all duration-300">
            <div className="relative flex flex-col items-center">
                <div className="relative flex h-24 w-24 mb-8">
                    {/* Ping Animation */}
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-20"></span>
                    
                    {/* Circle Background */}
                    <span className="relative inline-flex rounded-full h-24 w-24 bg-linear-to-tr from-indigo-600 to-indigo-500 shadow-2xl shadow-indigo-500/40 items-center justify-center border border-indigo-400/20">
                        {/* Bouncing Pencil Icon */}
                        <svg className="w-10 h-10 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </span>
                </div>
                
                {/* Text */}
                <div className="text-center space-y-2">
                    <h3 className="text-2xl font-black text-white tracking-widest uppercase animate-pulse">
                        Initializing Editor
                    </h3>
                    <p className="text-indigo-200/80 text-sm font-medium tracking-wide">
                        Preparing your workspace...
                    </p>
                </div>
            </div>
        </div>
    );
};

// ==========================================
// 12. DASHBOARD GUEST SKELETON (Landing View)
// ==========================================
export const DashboardGuestSkeleton = () => {
    return (
        // 1. Page Wrapper: Matches Guest View in Dashboard.jsx (py-12 sm:py-20 px-2 sm:px-4)
        <div className='w-full min-h-screen bg-slate-50 py-12 sm:py-20 relative overflow-hidden px-2 sm:px-4 animate-pulse'>
            
            {/* Background Blobs (Static) */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

            {/* 2. Container Wrapper: Matches <Container> (w-full px-2) */}
            <div className='w-full px-2'>
                
                {/* Centered Content Wrapper */}
                <div className="flex flex-col items-center justify-center relative z-10 h-full mt-10">
                    
                    {/* 3. Card: Matches max-w-2xl w-full p-6 sm:p-10 md:p-14 */}
                    <div className="bg-white p-6 sm:p-10 md:p-14 rounded-4xl shadow-2xl border border-slate-100 max-w-2xl w-full text-center relative overflow-hidden">
                        
                        {/* Top Gradient Bar */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-slate-200"></div>

                        {/* Icon Box */}
                        <div className="mb-6 sm:mb-8 inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-slate-200 mx-auto"></div>

                        {/* Title & Text */}
                        <div className="h-8 sm:h-10 bg-slate-200 rounded w-2/3 mx-auto mb-3 sm:mb-4"></div>
                        <div className="h-4 sm:h-5 bg-slate-200 rounded w-3/4 mx-auto mb-8 sm:mb-10"></div>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-10">
                            <div className="h-12 sm:h-14 bg-slate-200 rounded-2xl w-full sm:w-32"></div>
                            <div className="h-12 sm:h-14 bg-slate-200 rounded-2xl w-full sm:w-40"></div>
                        </div>

                        {/* Divider Section */}
                        <div className="pt-6 sm:pt-8 border-t border-slate-100">
                            <div className="h-3 bg-slate-200 rounded w-48 mx-auto mb-4 sm:mb-6"></div>
                            
                            {/* Icons Grid */}
                            <div className="grid grid-cols-3 gap-3 sm:gap-4 justify-items-center">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex flex-col items-center gap-2">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-200 rounded-lg"></div>
                                        <div className="h-2 w-12 bg-slate-200 rounded"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ==========================================
// 13. SMART DASHBOARD SKELETON (Decides View)
// ==========================================
export const DashboardSkeletonSelector = () => {
    // We try to read the auth status from Redux store
    const status = useSelector((state) => state.auth.status);

    // If logged in -> Show the complex dashboard grid
    // If guest -> Show the landing card
    return status ? <DashboardAuthSkeleton /> : <DashboardGuestSkeleton />;
};

// ==========================================
// 14. HOME SKELETON (Splash Screen)
// ==========================================
export const HomeSkeleton = () => {
    return (
        <div className="gpu-accelerate fixed inset-0 bg-white z-50 flex flex-col items-center justify-center overflow-hidden px-2 sm:px-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 z-0 opacity-[0.4]" 
                 style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
            </div>

            <div className="relative z-10 flex flex-col items-center">
                {/* Icon Animation */}
                <div className="mb-8 relative">
                    <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
                    <div className="relative bg-white p-6 rounded-full shadow-xl border border-blue-50">
                        <svg className="w-12 h-12 text-blue-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                    </div>
                </div>

                {/* Text Animation */}
                <h1 className="text-center animate-fade-in-up">
                    <span className="block text-2xl md:text-3xl font-bold text-slate-500 mb-0 tracking-wide uppercase">
                        Discover
                    </span>
                    <span className="block mt-0 text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-tight">
                        Blog Ideas &{' '}
                        <span className="relative inline-block">
                            <span className="relative z-10 bg-linear-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                                Stories
                            </span>
                            <span className="absolute bottom-2 left-0 w-full h-3 bg-indigo-100/50 z-0 rounded-full transform -rotate-2"></span>
                        </span>
                    </span>
                </h1>
                <p className="text-slate-400 mt-2 text-sm font-medium tracking-wide uppercase animate-pulse">
                    Curating your experience...
                </p>

                {/* Progress Bar */}
                <div className="w-48 h-1.5 bg-slate-100 rounded-full mt-8 overflow-hidden relative animate-fade-in-delay-200">
                    <div className="absolute top-0 left-0 h-full w-full bg-blue-600 rounded-full animate-progress-indeterminate origin-left"></div>
                </div>
            </div>
        </div>
    );
};

// ==========================================
// 15. GLOBAL SPLASH (App Booting - No Text)
// ==========================================
export const GlobalSplash = () => {
    return (
        <div className="fixed inset-0 bg-slate-50 z-9999 flex items-center justify-center overflow-hidden px-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 z-0 opacity-[0.4]" 
                 style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
            </div>

            <div className="relative z-10 flex flex-col items-center animate-fade-in-up">
                {/* Icon Animation */}
                <div className="relative">
                    <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-75"></div>
                    <div className="relative bg-white p-6 rounded-full shadow-xl border border-indigo-50">
                        <svg className="w-12 h-12 text-indigo-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};
