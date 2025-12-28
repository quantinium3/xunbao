import { useState, useRef, useEffect } from 'react';
import { authClient } from '../lib/auth-client';
import { useNavigate } from '@tanstack/react-router';
import toast from 'react-hot-toast';

function UserProfileDropdown() {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const session = authClient.useSession();
	const navigate = useNavigate();

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		}

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isOpen]);

	const handleLogout = async () => {
		try {
			await authClient.signOut();
			navigate({ to: '/sign-in' });
		} catch (error) {
			toast.error('Logout failed');
			console.error('Logout failed:', error);
		}
	};

	return (
		<div className="relative" ref={dropdownRef}>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="focus:outline-none rounded-full"
			>
				{session.data?.user.image ? (
					<img
						src={session.data?.user.image}
						alt="pfp"
						className="w-8 h-8 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
					/>
				) : (
					<img
						src="https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"
						alt="pfp"
						className="w-8 h-8 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
					/>
				)}
			</button>

			{isOpen && (
				<div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
					<div className="px-3 py-2 text-sm text-gray-700 border-b border-gray-200">
						<p className="font-semibold truncate">
							{session.data?.user.name || session.data?.user.email}
						</p>
					</div>

					<button
						onClick={handleLogout}
						className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
					>
						Logout
					</button>
				</div>
			)}
		</div>
	);
}

export default UserProfileDropdown;
