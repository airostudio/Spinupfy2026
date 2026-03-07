'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  Globe,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Button, Card, CardContent, CardFooter, Badge } from '@/components/ui';
import { Header } from '@/components/layout';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface Website {
  id: string;
  name: string;
  slug: string;
  description?: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  subdomain?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadUserAndWebsites();
  }, []);

  async function loadUserAndWebsites() {
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      setUser(user);

      // Load websites
      const { data, error } = await supabase
        .from('websites')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setWebsites(data || []);
    } catch (error) {
      console.error('Error loading websites:', error);
      toast.error('Failed to load websites');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(websiteId: string, websiteName: string) {
    if (!confirm(`Are you sure you want to delete "${websiteName}"?`)) {
      return;
    }

    setDeleting(websiteId);

    try {
      const { error } = await supabase
        .from('websites')
        .delete()
        .eq('id', websiteId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Website deleted successfully');
      setWebsites(websites.filter((w) => w.id !== websiteId));
    } catch (error) {
      console.error('Error deleting website:', error);
      toast.error('Failed to delete website');
    } finally {
      setDeleting(null);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/');
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your websites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Your Websites
            </h2>
            <p className="text-gray-400">
              Create, manage, and publish your AI-generated websites
            </p>
          </div>
          <Link href="/create">
            <Button leftIcon={<Plus className="w-5 h-5" />} size="lg">
              Create New Website
            </Button>
          </Link>
        </div>

        {/* AI Content Writer Feature Card */}
        <Link href="/dashboard/content-writer">
          <Card variant="gradient" className="mb-8 group cursor-pointer border-2 border-purple-500/30 hover:border-purple-500/60 transition-all">
            <CardContent className="flex items-center justify-between py-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                    AI Content Writer
                    <Badge variant="success" size="sm">New</Badge>
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Expert-level content generation with 20+ years of writing experience. Generate, proofread, and optimize content instantly.
                  </p>
                </div>
              </div>
              <div className="text-purple-400 group-hover:translate-x-1 transition-transform">
                <ExternalLink className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card variant="gradient">
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Websites</p>
                <p className="text-3xl font-bold text-white">{websites.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary-500/20 flex items-center justify-center">
                <Globe className="w-6 h-6 text-primary-400" />
              </div>
            </CardContent>
          </Card>

          <Card variant="gradient">
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Published</p>
                <p className="text-3xl font-bold text-white">
                  {websites.filter((w) => w.published).length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card variant="gradient">
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Drafts</p>
                <p className="text-3xl font-bold text-white">
                  {websites.filter((w) => !w.published).length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <Edit className="w-6 h-6 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Websites Grid */}
        {websites.length === 0 ? (
          <Card variant="glass" className="py-16">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No websites yet
              </h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Get started by creating your first AI-powered website. It only
                takes a few minutes!
              </p>
              <Link href="/create">
                <Button leftIcon={<Plus className="w-5 h-5" />} size="lg">
                  Create Your First Website
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {websites.map((website) => (
              <Card key={website.id} variant="glass" hover className="group">
                <CardContent>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-primary-400 transition-colors">
                        {website.name}
                      </h3>
                      {website.description && (
                        <p className="text-sm text-gray-400 line-clamp-2">
                          {website.description}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant={website.published ? 'success' : 'warning'}
                      size="sm"
                    >
                      {website.published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                    <Clock className="w-3 h-3" />
                    <span>Updated {formatDate(website.updated_at)}</span>
                  </div>

                  {website.published && website.subdomain && (
                    <div className="mb-4 p-2 rounded bg-gray-800/50 border border-gray-700">
                      <p className="text-xs text-gray-400 mb-1">Live URL</p>
                      <div className="flex items-center gap-2">
                        <Globe className="w-3 h-3 text-primary-400" />
                        <span className="text-xs text-primary-400 truncate">
                          {website.subdomain}.webese.ai
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex items-center gap-2">
                  <Link href={`/editor/${website.id}`} className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      leftIcon={<Edit className="w-4 h-4" />}
                    >
                      Edit
                    </Button>
                  </Link>
                  {website.published && (
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<ExternalLink className="w-4 h-4" />}
                      onClick={() =>
                        window.open(
                          `https://${website.subdomain}.webese.ai`,
                          '_blank'
                        )
                      }
                    >
                      View
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    onClick={() => handleDelete(website.id, website.name)}
                    disabled={deleting === website.id}
                    isLoading={deleting === website.id}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
