import React, { useState, useEffect } from 'react';
import appwriteService from '../appwrite/conf';
import { Link } from 'react-router-dom';
import parse from 'html-react-parser';
import { Calendar, User } from 'lucide-react';

function PostCard({ $id, title, featuredImage, content, $createdAt, userId }) {
  const [summary, setSummary] = useState("");
  const [author, setAuthor] = useState(null);

  useEffect(() => {
    if (content) {
      setSummary(content);
    }

    // Fetch the author using the userId from the post
    if (userId) {
      appwriteService.getUser(userId).then((user) => {
        setAuthor(user.name);
      }).catch((error) => {
        console.error("Error fetching author data:", error);
        setAuthor("Unknown"); // Fallback in case of an error
      });
    }
  }, [content, userId]);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 border border-gray-200">
      <div className="relative h-48 md:h-64 overflow-hidden">
        <img
          className="w-full h-full object-cover transition-transform duration-500 ease-in-out transform hover:scale-110"
          src={appwriteService.getFilePreview(featuredImage)}
          alt={title}
        />
        <div className="absolute inset-0 bg-black bg-opacity-30 transition-opacity duration-300 opacity-0 hover:opacity-100 flex items-center justify-center">
          <Link 
            to={`/post/${$id}`}
            className="px-4 py-2 bg-white text-gray-800 rounded-md font-semibold hover:bg-gray-100 transition-colors duration-200"
          >
            Read More
          </Link>
        </div>
      </div>
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 line-clamp-2 hover:text-blue-600 transition-colors duration-200">
          <Link to={`/post/${$id}`}>{title}</Link>
        </h2>
        <div className="flex items-center text-sm text-gray-500 mb-4 space-x-4">
          <div className="flex items-center">
            <User size={16} className="mr-1" />
            <span>{author ? author : "Loading..."}</span>
          </div>
          <div className="flex items-center">
            <Calendar size={16} className="mr-1" />
            <span>{new Date($createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="text-gray-600 mb-4 line-clamp-3">
          {parse(summary.split(' ').slice(0, 30).join(' '))}...
        </div>
        <Link 
          to={`/post/${$id}`}
          className="inline-block mt-2 text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200"
        >
          Continue Reading →
        </Link>
      </div>
    </div>
  );
}

export default PostCard;