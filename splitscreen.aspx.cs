using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace Client
{
    public partial class splitScreen : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack)
            {
                string token = Request.QueryString["token"];
                if (token == null)
                {
                    LoginSetting.Exist(Page);
                }
                else
                {
                    LoginSetting.VerifyByToken(Page, token);

                }
            }
        }
    }
}