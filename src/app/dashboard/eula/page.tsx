import { Dashboard } from "@/components/ui/containers";
import { Separator } from "@/components/ui/separator";

export default function EULAPage() {
  return (
    <Dashboard className='flex flex-col bg-white gap-[10px] pb-20'>
      <div className='mx-auto max-w-4xl'>
        <div className='mb-8'>
          <h2 className='text-red-600 mb-2 text-balance'>End-User License Agreement</h2>
          <p className='text-muted-foreground'>Last updated: September 01, 2023</p>
        </div>

        <div className='space-y-3 rounded-xl shadow-md border p-2 sm:p-4 mb-10'>
          <p className=' text-muted-foreground leading-relaxed'>
            Please read this End-User License Agreement carefully before clicking the "I Agree" button, downloading or
            using Oyoyo Event.
          </p>
        </div>

        <div className='space-y-8'>
          <section>
            <h3 className=' text-red-600 mb-4'>Interpretation and Definitions</h3>

            <div className='space-y-4'>
              <div>
                <h3 className=' mb-2'>Interpretation</h3>
                <p className=''>
                  The words of which the initial letter is capitalized have meanings defined under the following
                  conditions. The following definitions shall have the same meaning regardless of whether they appear in
                  singular or in plural.
                </p>
              </div>

              <div>
                <h3 className=' mb-3'>Definitions</h3>
                <p className=' mb-3'>For the purposes of this End-User License Agreement:</p>

                <div className='space-y-3 '>
                  <div>
                    <strong>Agreement</strong> means this End-User License Agreement that forms the entire agreement
                    between You and the Company regarding the use of the Application. This Agreement has been created
                    with the help of the EULA Generator.
                  </div>
                  <div>
                    <strong>Application</strong> means the software program provided by the Company downloaded by You to
                    a Device, named Oyoyo Event
                  </div>
                  <div>
                    <strong>Company</strong> (referred to as either "the Company", "We", "Us" or "Our" in this
                    Agreement) refers to Catwalk Creatives LTD, 2 Otunola Adebayo Street Ilorin.
                  </div>
                  <div>
                    <strong>Content</strong> refers to content such as text, images, or other information that can be
                    posted, uploaded, linked to or otherwise made available by You, regardless of the form of that
                    content.
                  </div>
                  <div>
                    <strong>Country</strong> refers to: Nigeria
                  </div>
                  <div>
                    <strong>Device</strong> means any device that can access the Application such as a computer, a
                    cellphone or a digital tablet.
                  </div>
                  <div>
                    <strong>Third-Party Services</strong> means any services or content (including data, information,
                    applications and other products services) provided by a third-party that may be displayed, included
                    or made available by the Application.
                  </div>
                  <div>
                    <strong>You</strong> means the individual accessing or using the Application or the company, or
                    other legal entity on behalf of which such individual is accessing or using the Application, as
                    applicable.
                  </div>
                </div>
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <h3 className=' text-red-600 mb-4'>Acknowledgment</h3>
            <div className='space-y-4'>
              <p>
                By clicking the "I Agree" button, downloading or using the Application, You are agreeing to be bound by
                the terms and conditions of this Agreement. If You do not agree to the terms of this Agreement, do not
                click on the "I Agree" button, do not download or do not use the Application.
              </p>
              <p>
                This Agreement is a legal document between You and the Company and it governs your use of the
                Application made available to You by the Company.
              </p>
              <p>
                The Application is licensed, not sold, to You by the Company for use strictly in accordance with the
                terms of this Agreement.
              </p>
            </div>
          </section>

          <Separator />

          <section>
            <h3 className=' text-red-600 mb-4'>License</h3>

            <div>
              <h3 className=' mb-3'>Scope of License</h3>
              <div className='space-y-4'>
                <p>
                  The Company grants You a revocable, non-exclusive, non-transferable, limited license to download,
                  install and use the Application strictly in accordance with the terms of this Agreement.
                </p>
                <p>
                  The license that is granted to You by the Company is solely for your personal, non-commercial purposes
                  strictly in accordance with the terms of this Agreement.
                </p>
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <h3 className=' text-red-600 mb-4'>Third-Party Services</h3>
            <div className='space-y-4'>
              <p>
                The Application may display, include or make available third-party content (including data, information,
                applications and other products services) or provide links to third-party websites or services.
              </p>
              <p>
                You acknowledge and agree that the Company shall not be responsible for any Third-party Services,
                including their accuracy, completeness, timeliness, validity, copyright compliance, legality, decency,
                quality or any other aspect thereof. The Company does not assume and shall not have any liability or
                responsibility to You or any other person or entity for any Third-party Services.
              </p>
              <p>
                You must comply with applicable Third parties' Terms of agreement when using the Application.
                Third-party Services and links thereto are provided solely as a convenience to You and You access and
                use them entirely at your own risk and subject to such third parties' Terms and conditions.
              </p>
            </div>
          </section>

          <Separator />

          <section>
            <h3 className=' text-red-600 mb-4'>Term and Termination</h3>
            <div className='space-y-4'>
              <p>
                This Agreement shall remain in effect until terminated by You or the Company. The Company may, in its
                sole discretion, at any time and for any or no reason, suspend or terminate this Agreement with or
                without prior notice.
              </p>
              <p>
                This Agreement will terminate immediately, without prior notice from the Company, in the event that you
                fail to comply with any provision of this Agreement. You may also terminate this Agreement by deleting
                the Application and all copies thereof from your Device or from your computer.
              </p>
              <p>
                Upon termination of this Agreement, You shall cease all use of the Application and delete all copies of
                the Application from your Device.
              </p>
              <p>
                Termination of this Agreement will not limit any of the Company's rights or remedies at law or in equity
                in case of breach by You (during the term of this Agreement) of any of your obligations under the
                present Agreement.
              </p>
            </div>
          </section>

          <Separator />

          <section>
            <h3 className=' text-red-600 mb-4'>Indemnification</h3>
            <p className=' leading-relaxed'>
              You agree to indemnify and hold the Company and its parents, subsidiaries, affiliates, officers,
              employees, agents, partners and licensors (if any) harmless from any claim or demand, including reasonable
              attorneys' fees, due to or arising out of your: (a) use of the Application; (b) violation of this
              Agreement or any law or regulation; or (c) violation of any right of a third party.
            </p>
          </section>

          <Separator />

          <section>
            <h3 className=' text-red-600 mb-4'>No Warranties</h3>
            <div className='space-y-4'>
              <p>
                The Application is provided to You "AS IS" and "AS AVAILABLE" and with all faults and defects without
                warranty of any kind. To the maximum extent permitted under applicable law, the Company, on its own
                behalf and on behalf of its affiliates and its and their respective licensors and service providers,
                expressly disclaims all warranties, whether express, implied, statutory or otherwise, with respect to
                the Application, including all implied warranties of merchantability, fitness for a particular purpose,
                title and non-infringement, and warranties that may arise out of course of dealing, course of
                performance, usage or trade practice.
              </p>
              <p>
                Without limitation to the foregoing, the Company provides no warranty or undertaking, and makes no
                representation of any kind that the Application will meet your requirements, achieve any intended
                results, be compatible or work with any other software, applications, systems or services, operate
                without interruption, meet any performance or reliability standards or be error free or that any errors
                or defects can or will be corrected.
              </p>
              <p>
                Without limiting the foregoing, neither the Company nor any of the company's provider makes any
                representation or warranty of any kind, express or implied: (i) as to the operation or availability of
                the Application, or the information, content, and materials or products included thereon; (ii) that the
                Application will be uninterrupted or error-free; (iii) as to the accuracy, reliability, or currency of
                any information or content provided through the Application; or (iv) that the Application, its servers,
                the content, or e-mails sent from or on behalf of the Company are free of viruses, scripts, trojan
                horses, worms, malware, timebombs or other harmful components.
              </p>
              <p>
                Some jurisdictions do not allow the exclusion of certain types of warranties or limitations on
                applicable statutory rights of a consumer, so some or all of the above exclusions and limitations may
                not apply to You. But in such a case the exclusions and limitations set forth in this section shall be
                applied to the greatest extent enforceable under applicable law. To the extent any warranty exists under
                law that cannot be disclaimed, the Company shall be solely responsible for such warranty.
              </p>
            </div>
          </section>

          <Separator />

          <section>
            <h3 className=' text-red-600 mb-4'>Limitation of Liability</h3>
            <div className='space-y-4'>
              <p>
                Notwithstanding any damages that You might incur, the entire liability of the Company and any of its
                suppliers under any provision of this Agreement and your exclusive remedy for all of the foregoing shall
                be limited to the amount actually paid by You for the Application or through the Application or 100 USD
                if You haven't purchased anything through the Application.
              </p>
              <p>
                To the maximum extent permitted by applicable law, in no event shall the Company or its suppliers be
                liable for any special, incidental, indirect, or consequential damages whatsoever (including, but not
                limited to, damages for loss of profits, loss of data or other information, for business interruption,
                for personal injury, loss of privacy arising out of or in any way related to the use of or inability to
                use the Application, third-party software and/or third-party hardware used with the Application, or
                otherwise in connection with any provision of this Agreement), even if the Company or any supplier has
                been advised of the possibility of such damages and even if the remedy fails of its essential purpose.
              </p>
              <p>
                Some states/jurisdictions do not allow the exclusion or limitation of incidental or consequential
                damages, so the above limitation or exclusion may not apply to You.
              </p>
            </div>
          </section>

          <Separator />

          <section>
            <h3 className=' text-red-600 mb-4'>Severability and Waiver</h3>

            <div className='space-y-4'>
              <div>
                <h3 className=' mb-2'>Severability</h3>
                <p className=' leading-relaxed'>
                  If any provision of this Agreement is held to be unenforceable or invalid, such provision will be
                  changed and interpreted to accomplish the objectives of such provision to the greatest extent possible
                  under applicable law and the remaining provisions will continue in full force and effect.
                </p>
              </div>

              <div>
                <h3 className=' mb-2'>Waiver</h3>
                <p className=' leading-relaxed'>
                  Except as provided herein, the failure to exercise a right or to require performance of an obligation
                  under this Agreement shall not effect a party's ability to exercise such right or require such
                  performance at any time thereafter nor shall the waiver of a breach constitute a waiver of any
                  subsequent breach.
                </p>
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <h3 className=' text-red-600 mb-4'>Product Claims</h3>
            <p className=' leading-relaxed'>The Company does not make any warranties concerning the Application.</p>
          </section>

          <Separator />

          <section>
            <h3 className=' text-red-600 mb-4'>United States Legal Compliance</h3>
            <p className=' leading-relaxed'>
              You represent and warrant that (i) You are not located in a country that is subject to the United States
              government embargo, or that has been designated by the United States government as a "terrorist
              supporting" country, and (ii) You are not listed on any United States government list of prohibited or
              restricted parties.
            </p>
          </section>

          <Separator />

          <section>
            <h3 className=' text-red-600 mb-4'>Changes to this Agreement</h3>
            <div className='space-y-4'>
              <p>
                The Company reserves the right, at its sole discretion, to modify or replace this Agreement at any time.
                If a revision is material we will provide at least 30 days' notice prior to any new terms taking effect.
                What constitutes a material change will be determined at the sole discretion of the Company.
              </p>
              <p>
                By continuing to access or use the Application after any revisions become effective, You agree to be
                bound by the revised terms. If You do not agree to the new terms, You are no longer authorized to use
                the Application.
              </p>
            </div>
          </section>

          <Separator />

          <section>
            <h3 className=' text-red-600 mb-4'>Governing Law</h3>
            <p className=' leading-relaxed'>
              The laws of the Country, excluding its conflicts of law rules, shall govern this Agreement and your use of
              the Application. Your use of the Application may also be subject to other local, state, national, or
              international laws.
            </p>
          </section>

          <Separator />

          <section>
            <h3 className=' text-red-600 mb-4'>Entire Agreement</h3>
            <div className='space-y-4'>
              <p>
                The Agreement constitutes the entire agreement between You and the Company regarding your use of the
                Application and supersedes all prior and contemporaneous written or oral agreements between You and the
                Company.
              </p>
              <p>
                You may be subject to additional terms and conditions that apply when You use or purchase other
                Company's services, which the Company will provide to You at the time of such use or purchase.
              </p>
            </div>
          </section>

          <Separator />

          <section>
            <h3 className=' text-red-600 mb-4'>Contact Us</h3>
            <div className=' leading-relaxed'>
              <p className='mb-2'>If you have any questions about this Agreement, You can contact Us:</p>
              <p>
                By email:{" "}
                <a href='mailto:feedback@oyoyoapp.com' className='text-red-600 hover:underline'>
                  feedback@oyoyoapp.com
                </a>
              </p>
            </div>
          </section>

          <div className='mt-12 pt-8 border-t'>
            <p className='text-xs text-muted-foreground text-center'>Generated using Privacy Policies Generator</p>
          </div>
        </div>
      </div>
    </Dashboard>
  );
}
